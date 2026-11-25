# Offline tests: no network, nothing written outside a temp folder.
# Run from the repo root: python -m unittest discover -s github-profile/scripts -p "test_*.py"
import json, os, re, shutil, tempfile, time, unittest
import xml.etree.ElementTree as ET
from datetime import date, timedelta
from unittest import mock

import board, build, cards, fetch, graphs, phone, svgkit

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DEV = os.path.join(ROOT, "dev")
DASHES = (chr(0x2014), chr(0x2013))   # the long dashes the owner's rules ban


def read(path):
    with open(path, encoding="utf8") as f:
        return f.read()


def days_of(cal):
    return {d: c for d, c, _ in cal["days"] if c}


class FailingNet(fetch.Net):
    """Offline fixtures, except that the named fixtures cannot be read."""
    def __init__(self, fail):
        super().__init__(offline=True)
        self.fail = fail

    def get(self, url, name, binary=False):
        if any(name.startswith(f) for f in self.fail):
            raise fetch.SourceError(f"simulated failure for {name}")
        return super().get(url, name, binary)


class CalendarTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = read(os.path.join(DEV, "fixture-contrib.html"))
        cls.cal = fetch.parse_calendar(cls.html)

    def test_last_year_total_and_cells(self):
        self.assertEqual(self.cal["heading"], 11507)
        self.assertEqual(len(self.cal["days"]), 367)
        self.assertEqual(sum(c for _, c, _ in self.cal["days"]), 11507)

    def test_current_streak_is_58_days_from_28_sep(self):
        cur, best = fetch.streaks(days_of(self.cal), date(2026, 11, 24))
        self.assertEqual((cur["days"], cur["start"]), (58, "2026-09-28"))
        self.assertGreaterEqual(best["days"], 58)

    def test_missing_today_does_not_break_the_streak(self):
        days = days_of(self.cal)
        self.assertGreater(days["2026-11-24"], 0)
        del days["2026-11-24"]                        # nothing yet today
        cur, _ = fetch.streaks(days, date(2026, 11, 24))
        self.assertEqual((cur["days"], cur["start"], cur["end"]), (57, "2026-09-28", "2026-11-23"))

    def test_a_missed_yesterday_does_break_it(self):
        days = {"2026-11-20": 1, "2026-11-22": 2, "2026-11-23": 1}
        cur, best = fetch.streaks(days, date(2026, 11, 24))
        self.assertEqual(cur["days"], 2)
        self.assertEqual(best["days"], 2)
        cur, _ = fetch.streaks({"2026-11-21": 1}, date(2026, 11, 24))
        self.assertEqual(cur["days"], 0)

    def test_longest_streak_can_be_an_old_one(self):
        days = {f"2025-03-{d:02d}": 1 for d in range(1, 11)}
        days["2026-11-24"] = 1
        cur, best = fetch.streaks(days, date(2026, 11, 24))
        self.assertEqual(cur["days"], 1)
        self.assertEqual((best["days"], best["start"], best["end"]), (10, "2025-03-01", "2025-03-10"))

    def test_heading_mismatch_aborts(self):
        bad = self.html.replace("11,507", "11,508", 1)
        with self.assertRaises(fetch.CalendarError):
            fetch.parse_calendar(bad)

    def test_slim_fixture_parses_the_same(self):
        slim = fetch.parse_calendar(fetch.slim_contrib(self.html))
        self.assertEqual(slim["heading"], 11507)
        self.assertEqual(slim["days"], self.cal["days"])


class FallbackTests(unittest.TestCase):
    def setUp(self):
        self.P = json.loads(read(os.path.join(ROOT, "profile.json")))
        self.today = date.fromisoformat(json.loads(read(os.path.join(fetch.FIXTURES, "meta.json")))["today"])

    def test_failed_source_falls_back_to_the_saved_copy(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        saved = json.loads(json.dumps(state))
        saved["sources"]["repos"]["stars"] = 4242          # a recognisable saved value
        data, new_state, notes = fetch.collect(FailingNet(["repos", "releases-"]), self.P, self.today, saved)
        self.assertEqual(data["repos"]["stars"], 4242)
        self.assertIn("state.json", dict(notes)["repos"])
        self.assertEqual(new_state["sources"]["repos"]["stars"], 4242)
        self.assertEqual(data["challenge"], state["sources"]["challenge"])  # the others came live (from fixtures)

    def test_no_saved_copy_means_stop_not_invent(self):
        with self.assertRaises(fetch.SourceError):
            fetch.collect(FailingNet(["itunes"]), self.P, self.today, None)

    def test_unreadable_calendar_stops_even_with_a_saved_state(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        with self.assertRaises(fetch.CalendarError):
            fetch.collect(FailingNet(["contrib-last-year"]), self.P, self.today, state)

    def test_failed_build_writes_nothing(self):
        out = tempfile.mkdtemp()
        try:
            with self.assertRaises(fetch.CalendarError):
                build.run(offline=True, out_root=out, net=FailingNet(["contrib-last-year"]), log=lambda *_: None)
            self.assertEqual(os.listdir(out), [])
        finally:
            shutil.rmtree(out)

    def test_completed_years_are_read_from_state_not_the_network(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        data, _, _ = fetch.collect(FailingNet(["contrib-2020", "contrib-2021", "contrib-2025"]), self.P, self.today, state)
        self.assertGreater(data["contrib"]["all_time"], data["contrib"]["last_year"])


def challenge_block(cid, status, title="Road to 10,000 on X", start="2026-11-20", days=42, target=True, counts=(), plat_start=2664):
    """One challenge written the way zazag.dev/data.js writes it (entries one per line)."""
    tg = '      target: { pid: "x", n: 10000 },\n' if target else ""
    entries = "\n".join('        {"day":%d,"done":[],"n":{"x":5},"counts":{"yt":30,"x":%d}},' % (i + 1, c) for i, c in enumerate(counts))
    return (f'    {{ id: "{cid}", title: "{title}", status: "{status}",\n'
            f'      summary: "A test challenge.",\n      start: "{start}", days: {days}, lastUpdate: "2026-11-23T23:26:07.159Z",\n{tg}'
            f'      goals: [\n        {{ id: "x", plat: "X", name: "X posts", label: "X posts", kind: "Post", short: "X", rule: "5 a day", per: "day", target: 5 }}\n      ],\n'
            f'      platforms: [\n        {{ id: "x", name: "X", label: "followers", one: "follower", url: "https://x.com/ZazaGDev", start: {plat_start} }}\n      ],\n'
            f'      entries: [\n{entries}\n      ] }}')


def data_js(*blocks):
    return "const SITE = {\n  platforms: [ { pid: \"x\", now: 1 } ],\n  challenges: [\n" + ",\n".join(blocks) + "\n  ]\n};\n"


class JsNet(fetch.Net):
    """Offline fixtures, except that zazag.dev/data.js is the text given."""
    def __init__(self, js):
        super().__init__(offline=True)
        self.js = js

    def get(self, url, name, binary=False):
        return self.js if name == "data.js" else super().get(url, name, binary)


def with_challenge(js):
    """data (with the challenge read from `js`) and P, from the offline fixtures."""
    P = json.loads(read(os.path.join(ROOT, "profile.json")))
    today = date.fromisoformat(json.loads(read(os.path.join(fetch.FIXTURES, "meta.json")))["today"])
    data, _, _ = fetch.collect(JsNet(js), P, today)
    return data, P


class ChallengeTests(unittest.TestCase):
    """Every reader of the challenges in data.js handles planned, active on day 0, active and completed."""

    def test_the_real_fixture_reads_as_it_always_did(self):
        c = fetch.fetch_challenge(fetch.Net(offline=True))
        self.assertEqual((c["state"], c["id"], c["day"], c["days"], c["count"], c["end"]), ("active", "x", 4, 42, 3216, "2026-12-31"))
        self.assertEqual(c["target"], {"pid": "x", "n": 10000})
        P = json.loads(read(os.path.join(ROOT, "profile.json")))
        data = {"challenge": c, "repos": {"repos": {"FocusShell": {"tag": "v2.0.0"}}}}
        v = cards.challenge_view(c)
        self.assertEqual((v["title"], v["count"], v["note"]), ("Road to 10,000 on X", "3,216 / 10,000", "day 4 of 42, until 31 Dec"))
        # The hero carries no challenge bar (owner, 2026-11-24), so its alt text names no challenge either.
        self.assertNotIn("Road to", cards.hero_label(P, data))
        self.assertNotIn("Road to", cards.hero("dark", data, P).render())
        self.assertNotIn("Road to", phone.hero_phone("dark", data, P).render())
        self.assertIn("Now: Road to 10,000 followers on X, 3,216 after day 4 of 42. ", cards.whoami_label(data, P))
        lines, _ = cards.whoami_lines(data, P)
        self.assertIn("Road to 10,000 followers on X: 3,216 after day 4 of 42", "".join(t for t, _, _ in lines[-3]))

    def test_planned_only_shows_no_challenge_and_never_a_running_one(self):
        data, P = with_challenge(data_js(challenge_block("x", "planned", counts=[2700])))
        self.assertEqual(data["challenge"], {"state": "none"})
        self.assertIsNone(cards.challenge_view(data["challenge"]))
        self.assertNotIn("Road to 10,000", cards.hero_label(P, data))
        self.assertNotIn("Road to 10,000", cards.whoami_label(data, P))
        for t in cards.THEMES:        # the cards still draw, without the bar
            self.assertNotIn("Road to", cards.hero(t, data, P).render().split("</defs>")[1])
            phone.hero_phone(t, data, P).render()
            cards.whoami(t, data, P).render()

    def test_active_on_day_zero_shows_the_start_not_an_invented_count(self):
        data, P = with_challenge(data_js(challenge_block("x", "active", counts=[], plat_start=2664)))
        c = data["challenge"]
        self.assertEqual((c["state"], c["day"], c["count"], c["count_is_start"]), ("active", 0, 2664, True))
        v = cards.challenge_view(c)
        self.assertEqual((v["count"], v["note"]), ("2,664 / 10,000", "day 0 of 42, until 31 Dec"))
        self.assertEqual(v["now"], ("Road to 10,000 followers on X", "2,664 at the start, day 0 of 42"))
        self.assertTrue(v["live"])

    def test_active_with_entries_uses_the_last_count(self):
        data, _ = with_challenge(data_js(challenge_block("x", "active", counts=[2700, 2710, 2790])))
        c = data["challenge"]
        self.assertEqual((c["day"], c["count"], c["count_is_start"]), (3, 2790, False))
        self.assertEqual(cards.challenge_view(c)["count"], "2,790 / 10,000")

    def test_active_without_a_target_counts_days(self):
        data, P = with_challenge(data_js(challenge_block("30-days", "active", title="30 days of building in public",
                                                          start="2026-10-12", days=30, target=False, counts=[1, 2, 3])))
        v = cards.challenge_view(data["challenge"])
        self.assertEqual((v["count"], v["note"], v["live"]), ("day 3 of 30", "until 10 Nov", True))
        self.assertIn("day 3 of 30", cards.whoami_label(data, P))

    def test_completed_only_is_shown_as_finished_at_the_last_logged_count(self):
        data, P = with_challenge(data_js(challenge_block("x", "completed", counts=[2700, 3100, 3216])))
        c = data["challenge"]
        self.assertEqual((c["state"], c["count"]), ("finished", 3216))
        v = cards.challenge_view(c)
        self.assertEqual((v["live"], v["count"], v["note"]), (False, "3,216 / 10,000", "finished"))
        self.assertEqual(v["alt"], "Road to 10,000 on X: finished at 3,216.")
        label = cards.whoami_label(data, P)
        self.assertIn("Last challenge: Road to 10,000 followers on X, finished at 3,216.", label)
        self.assertNotIn("after day", label)
        svg = cards.hero("light", data, P).render()
        self.assertNotIn('class="pulse"', svg)               # a finished challenge does not pulse

    def test_a_finished_challenge_with_nothing_logged_has_no_invented_count(self):
        data, _ = with_challenge(data_js(challenge_block("x", "completed", counts=[], plat_start=2664)))
        self.assertIsNone(data["challenge"]["count"])
        v = cards.challenge_view(data["challenge"])
        self.assertEqual((v["note"], v["count"]), ("finished", "42 days"))

    def test_an_active_challenge_wins_over_completed_ones_and_the_latest_completed_is_picked(self):
        old = challenge_block("30-days", "completed", title="30 days", start="2026-10-12", days=30, target=False, counts=[1])
        planned = challenge_block("later", "planned", title="Next one", start="2027-02-01", days=10, target=False)
        done = challenge_block("x", "completed", counts=[2700, 3216])
        data, _ = with_challenge(data_js(old, done, planned))
        self.assertEqual((data["challenge"]["id"], data["challenge"]["state"]), ("x", "finished"))
        live = challenge_block("y", "active", title="Another", start="2027-01-05", days=20, target=False, counts=[1])
        data, _ = with_challenge(data_js(old, done, planned, live))
        self.assertEqual((data["challenge"]["id"], data["challenge"]["state"]), ("y", "active"))

    def test_a_broken_active_challenge_is_a_source_error(self):
        js = data_js(challenge_block("x", "active").replace("days: 42", "daze: 42"))
        with self.assertRaises(fetch.SourceError):
            fetch.fetch_challenge(JsNet(js))

    def test_every_state_draws_every_card_and_the_numbers_log(self):
        for js in (data_js(challenge_block("x", "planned")), data_js(challenge_block("x", "active")),
                   data_js(challenge_block("x", "active", counts=[2700])), data_js(challenge_block("x", "completed", counts=[3216]))):
            data, P = with_challenge(js)
            svgs = build.make_assets(data, P)
            for name, s in svgs.items():
                ET.fromstring(s.render())
                self.assertEqual(s.overflow, [], name)
            build.numbers(data, P)


class StreakAndVersionTests(unittest.TestCase):
    def setUp(self):
        self.P = json.loads(read(os.path.join(ROOT, "profile.json")))
        data, _, _ = fetch.collect(fetch.Net(offline=True), self.P, date.fromisoformat(json.loads(read(os.path.join(fetch.FIXTURES, "meta.json")))["today"]))
        self.data = data

    def test_no_current_streak_never_prints_none(self):
        self.data["contrib"]["current_streak"] = {"days": 0, "start": None, "end": None}
        counters = board.counters(self.data)
        self.assertEqual(counters[1], ("0 days", "no streak right now"))
        self.assertNotIn("None", board.board_label(self.data))
        self.assertIn("no streak right now", board.board_label(self.data))
        logged = dict((k, v) for k, v, _ in build.numbers(self.data, self.P))
        self.assertEqual(logged["current streak"], "no streak right now")
        for t in cards.THEMES:
            for svg in (board.github_board(t, self.data), phone.github_board_phone(t, self.data)):
                self.assertNotIn("None", svg.render().split("</defs>")[1])

    def test_a_running_streak_still_says_since(self):
        self.assertEqual(board.counters(self.data)[1], ("58 days", "current streak, since 28 Sep"))
        self.assertIn("a 58-day current streak, since 28 Sep", board.board_label(self.data))

    def test_no_release_tag_leaves_the_version_out_of_the_whoami_line(self):
        self.data["repos"]["repos"]["FocusShell"]["tag"] = None
        lines, now = cards.whoami_lines(self.data, self.P)
        self.assertIn("FocusShell: many Claude Code agents, one window", now)
        self.assertFalse(any("FocusShell :" in n or "  " in n for n in now))
        self.assertNotIn("FocusShell :", cards.whoami_label(self.data, self.P))
        self.data["repos"]["repos"]["FocusShell"]["tag"] = "v2.0.0"
        self.assertIn("FocusShell v2.0.0: many Claude Code agents, one window", cards.whoami_lines(self.data, self.P)[1])
        del self.data["repos"]["repos"]["FocusShell"]                     # not in the repo list at all
        self.assertIn("FocusShell: many Claude Code agents, one window", cards.whoami_lines(self.data, self.P)[1])


class StaleSourceTests(unittest.TestCase):
    def setUp(self):
        self.P = json.loads(read(os.path.join(ROOT, "profile.json")))
        self.today = date.fromisoformat(json.loads(read(os.path.join(fetch.FIXTURES, "meta.json")))["today"])

    def test_good_fetch_dates_are_recorded_per_source(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        self.assertEqual(state["good"], {k: self.today.isoformat() for k in ("repos", "challenge", "videos", "appstore")})
        self.assertEqual(fetch.stale_sources(state["good"], self.today), [])

    def test_a_failing_source_keeps_its_old_date_and_goes_stale_after_three_days(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        state = json.loads(json.dumps(state))
        for k in state["good"]:
            state["good"][k] = (self.today - timedelta(days=3)).isoformat()
        _, new_state, _ = fetch.collect(FailingNet(["itunes"]), self.P, self.today, state)
        self.assertEqual(new_state["good"]["appstore"], (self.today - timedelta(days=3)).isoformat())   # not refreshed
        self.assertEqual(new_state["good"]["repos"], self.today.isoformat())
        self.assertEqual(fetch.stale_sources(new_state["good"], self.today), [])                         # 3 days is not older than 3
        late = self.today + timedelta(days=1)
        self.assertEqual([k for k, _ in fetch.stale_sources(new_state["good"], late)], ["appstore"])

    def test_an_old_state_without_good_dates_starts_from_its_fetched_day(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        old = {"fetched": (self.today - timedelta(days=9)).isoformat(), "sources": state["sources"], "years": state["years"]}
        _, new_state, _ = fetch.collect(FailingNet(["itunes"]), self.P, self.today, old)
        self.assertEqual(new_state["good"]["appstore"], old["fetched"])

    def test_stale_run_still_writes_the_cards_but_exits_non_zero(self):
        _, state, _ = fetch.collect(fetch.Net(offline=True), self.P, self.today)
        state = json.loads(json.dumps(state))
        state["good"]["appstore"] = (self.today - timedelta(days=5)).isoformat()
        out = tempfile.mkdtemp()
        try:
            path = os.path.join(out, "state.json")
            with open(path, "w", encoding="utf8") as f:
                json.dump(state, f)
            net = FailingNet(["itunes"])
            res = build.run(offline=False, out_root=out, state_path=path, today=self.today, net=net, log=lambda *_: None)
            self.assertEqual([k for k, _ in res["stale"]], ["appstore"])
            self.assertTrue(os.path.exists(os.path.join(out, "README.md")))          # the cards were written
            self.assertTrue(os.path.exists(os.path.join(out, "assets", "hero-light.svg")))
            with open(path, encoding="utf8") as f:
                self.assertEqual(json.load(f)["good"]["appstore"], state["good"]["appstore"])
            with mock.patch.object(build, "run", return_value=res), mock.patch("builtins.print") as shown:
                self.assertEqual(build.main([]), 1)
            self.assertIn("appstore", str(shown.call_args_list))
            fresh = dict(res, stale=[])
            with mock.patch.object(build, "run", return_value=fresh):
                self.assertEqual(build.main([]), 0)
        finally:
            shutil.rmtree(out)

    def test_the_workflow_goes_red_after_committing(self):
        text = read(os.path.join(ROOT, ".github", "workflows", "nightly.yml"))
        self.assertIn("continue-on-error: true", text)
        self.assertIn("steps.build.outcome == 'failure'", text)
        self.assertLess(text.index("git commit"), text.index("steps.build.outcome == 'failure'"))


class BuildTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.out = tempfile.mkdtemp()
        cls.res = build.run(offline=True, out_root=cls.out, log=lambda *_: None)
        cls.P = json.loads(read(os.path.join(ROOT, "profile.json")))

    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(cls.out)

    def test_every_svg_parses_as_xml_and_is_light_enough(self):
        files = [f for f in self.res["files"] if f.endswith(".svg")]
        self.assertGreaterEqual(len(files), 24)
        for rel in files:
            text = read(os.path.join(self.out, rel))
            ET.fromstring(text)
            self.assertLess(len(text.encode("utf8")), 150 * 1024, rel)

    def test_same_input_gives_the_same_bytes(self):
        # otherwise the nightly job would commit every night (font subsets once carried a timestamp)
        time.sleep(1.1)
        again = build.make_assets(self.res["data"], self.P)["badge-x-dark.svg"].render()
        self.assertEqual(again, self.res["files"]["assets/badge-x-dark.svg"])

    def test_no_text_runs_off_a_card(self):
        self.assertEqual(self.res["warnings"], [])

    def test_type_is_big_enough(self):
        svgs = build.make_assets(self.res["data"], self.P)
        floors = {"hero-": 15, "github-": 15, "graph-": 8, "line-": 15, "whoami-": 15, "label-": 15, "badge-": 15, "app-": 13, "video-": 13}
        for name, s in svgs.items():
            for prefix, floor in floors.items():
                if name.startswith(prefix):
                    self.assertGreaterEqual(s.min_size, floor, f"{name} has text at {s.min_size}px")

    def test_readme_has_no_long_dashes_and_every_picture_has_a_dark_source(self):
        text = self.res["files"]["README.md"]
        for d in DASHES:
            self.assertNotIn(d, text)
        pictures = re.findall(r"<picture>.*?</picture>", text)
        self.assertGreaterEqual(len(pictures), 14)
        for p in pictures:
            self.assertIn('<source media="(prefers-color-scheme: dark)"', p)
            self.assertRegex(p, r'<img src="assets/[^"]+-light\.svg"[^>]* alt="[^"]+"')

    def test_readme_images_all_exist(self):
        text = self.res["files"]["README.md"]
        refs = set(re.findall(r'(?:src|srcset)="(assets/[^"]+)"', text))
        self.assertTrue(refs)
        for ref in refs:
            self.assertTrue(os.path.exists(os.path.join(self.out, ref)), ref)

    def test_programmer_simulator_is_never_on_the_app_store(self):
        files = dict(self.res["files"])
        files["profile.json"] = read(os.path.join(ROOT, "profile.json"))
        files["state.json"] = json.dumps(self.res["data"]["appstore"])
        for name, text in files.items():
            if not name.endswith((".svg", ".md", ".json")):
                continue
            self.assertNotIn("Out since", text, name)
            self.assertNotIn("apps.apple.com/us/app/programmer-simulator", text, name)
            self.assertNotIn("ps_release", text, name)
            for m in re.finditer("Programmer Simulator", text):
                self.assertNotIn("App Store", text[max(0, m.start() - 60):m.end() + 60], name)
        ps = [a for a in self.P["apps"] if a["id"] == "programmer-simulator"][0]
        self.assertEqual((ps["status"], ps["url"]), ("in the works", "https://zazag.dev/apps/programmer-simulator/"))
        self.assertNotIn("programmer_simulator", self.P["itunes"])
        self.assertIn("https://zazag.dev/apps/programmer-simulator/", self.res["files"]["README.md"])

    def test_graph_totals_are_the_sum_of_their_cells(self):
        today = date.fromisoformat(self.res["data"]["today"])
        days = self.res["data"]["contrib"]["days"]
        files = self.res["files"]
        for key, summary, start, end, words in graphs.graph_specs(self.res["data"], today):
            cells = graphs.cells_of(days, start, end)
            total = sum(c for _, c in cells)
            for name in (f"graph-{key}", f"graph-{key}-phone"):
                svg = files[f"assets/{name}-light.svg"]
                self.assertIn(f"{total:,}", re.findall(r"<text [^>]*>([^<]*)</text>", svg)[0], name)
                self.assertIn(f'aria-label="{graphs.title_of(total, words)}"', svg, name)
                dim = (graphs.DESKTOP_WIDE if key == "6m" else graphs.DESKTOP_YEAR) if name == f"graph-{key}" else \
                      (graphs.PHONE_WIDE if key == "6m" else graphs.PHONE_YEAR)
                lit = len(re.findall(r'<rect x="[\d.]+" y="[\d.]+" width="%s" height="%s"' % (dim.cw, dim.ch), svg))
                self.assertEqual(lit, len(cells), name)                 # one rect per day, no more, no less
                printed = [(int(a)) for a in re.findall(r'data-count="(\d+)"', svg)]
                self.assertEqual(printed, [c for _, c in cells], name)    # every day prints its count, 0 included
                shown = re.findall(r'<text [^>]*data-count="(\d+)"[^>]*>([^<]*)</text>', svg)
                for count, txt in shown:                                  # every printed number is that day's count
                    self.assertEqual(txt, count if not txt.endswith("k") else f"{int(count) / 1000:.1f}k", name)
        # the totals also match the calendars GitHub gave us
        for y in range(2020, today.year):
            cal = fetch.parse_calendar(read(os.path.join(fetch.FIXTURES, f"contrib-{y}.html")))
            self.assertIn(graphs.title_of(cal["heading"], f"in {y}"), files["README.md"])
        last = fetch.parse_calendar(read(os.path.join(fetch.FIXTURES, "contrib-last-year.html")))
        self.assertIn(graphs.title_of(last["heading"], "in the last 12 months"), files["README.md"])

    def test_an_empty_year_is_an_empty_grid_with_zero(self):
        s, total, title = graphs.graph_image("light", graphs.DESKTOP_YEAR, {}, date(2019, 1, 1), date(2019, 12, 31), "in 2019")
        self.assertEqual((total, title), (0, "0 contributions in 2019"))
        self.assertEqual(len(re.findall(r'data-count="0"[^>]*>0</text>', s.render())), 365)
        self.assertEqual(len(re.findall(r'<rect x="[\d.]+" y="[\d.]+" width="26"', s.render())), 365)

    def test_the_30_day_line_chart_plots_the_daily_counts(self):
        today = date.fromisoformat(self.res["data"]["today"])
        days = self.res["data"]["contrib"]["days"]
        cells = graphs.last_days(self.res["data"], today)
        self.assertEqual(len(cells), 30)
        self.assertEqual(cells[-1][0], today - timedelta(days=1))          # ends on yesterday, the last full day
        want = [days.get((today - timedelta(days=30 - i)).isoformat(), 0) for i in range(30)]
        for name, phone in (("line-30d", False), ("line-30d-phone", True)):
            svg = self.res["files"][f"assets/{name}-light.svg"]
            dots = re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)"[^>]*data-count="(\d+)"', svg)
            self.assertEqual([int(c) for _, _, c in dots], want, name)
            tick_ys = {int(v): float(y) for y, v in re.findall(r'<text x="[\d.]+" y="([\d.]+)"[^>]*text-anchor="end"[^>]*>(\d+)</text>', svg)}
            self.assertEqual(max(tick_ys), max(want), name)                # the top label is a value the chart reaches
            self.assertEqual(min(tick_ys), 0, name)
            base, top = tick_ys[0] - 5, tick_ys[max(want)] - 5
            for (_, y, c) in dots:                                         # one linear scale for every dot
                self.assertAlmostEqual((base - float(y)) / (base - top), int(c) / max(want), places=2)
            self.assertIn(f"{sum(want):,} contributions in the last 30 days", svg)
            self.assertIn(f"{sum(want):,} contributions in the last 30 days", self.res["files"]["README.md"])
        text = self.res["files"]["README.md"]
        self.assertGreater(text.index("line-30d-light.svg"), text.rindex("</details>"))     # right below the graph section

    def test_30_day_line_chart_month_labels_never_overlap_over_a_year(self):
        data = {"contrib": {"days": {}}}
        month_re = re.compile(r'<text x="([\d.]+)" y="[\d.]+"[^>]*font-size="(\d+)"[^>]*text-anchor="(start|middle|end)"[^>]*>([A-Z][a-z]{2})</text>')
        for phone_flag in (False, True):
            saw_two = False
            for yr, ndays in ((2026, 365), (2028, 366)):                   # common year and leap year
                start = date(yr, 1, 1)
                for offset in range(ndays):
                    d = start + timedelta(days=offset)
                    s, _, _ = graphs.line_chart("light", data, d, phone=phone_flag)
                    self.assertEqual(s.overflow, [], f"{d} phone={phone_flag}")
                    found = month_re.findall("".join(s.parts))
                    self.assertGreaterEqual(len(found), 1, f"{d} phone={phone_flag}")
                    if len(found) >= 2:
                        saw_two = True
                    spans = []
                    for x, size, anchor, txt in found:
                        w = svgkit.text_width(txt, "m400", int(size))
                        x = float(x)
                        left = x - w / 2 if anchor == "middle" else x - w if anchor == "end" else x
                        spans.append((left, left + w, txt))
                    spans.sort()
                    for (_, r1, t1), (l2, _, t2) in zip(spans, spans[1:]):
                        self.assertGreater(l2, r1, f"{d} phone={phone_flag}: {t1} and {t2} overlap")
            self.assertTrue(saw_two, f"phone={phone_flag}")

    def test_readme_has_one_details_per_year_and_the_default_graph_outside(self):
        text = self.res["files"]["README.md"]
        today = date.fromisoformat(self.res["data"]["today"])
        details = re.findall(r"<details><summary>([^<]*)</summary>.*?assets/graph-([^-]+)-light\.svg.*?</details>", text, flags=re.S)
        expected_labels = ["Last 12 months"] + [str(y) for y in range(today.year, 2019, -1)]
        self.assertEqual([s.split(": ", 1)[0] for s, _ in details], expected_labels)
        for summary, key in details:
            svg = self.res["files"][f"assets/graph-{key}-light.svg"]
            graph_total_str = re.findall(r"<text [^>]*>([^<]*)</text>", svg)[0]
            graph_total = sum(int(c) for c in re.findall(r'data-count="(\d+)"', svg))
            self.assertEqual(graph_total_str, f"{graph_total:,}", key)
            unit = "contribution" if graph_total == 1 else "contributions"
            self.assertEqual(summary.split(": ", 1)[1], f"{graph_total:,} {unit}", key)
        self.assertEqual(text.count("<details>"), text.count("</details>"))
        self.assertLess(text.index("graph-6m-light.svg"), text.index("<details>"))
        self.assertEqual(len(re.findall(r"graph-6m-light\.svg", text)), 1)
        outside = re.sub(r"<details>.*?</details>", "", text, flags=re.S)
        self.assertIn("graph-6m-light.svg", outside)
        self.assertNotIn("graph-12m", outside)
        self.assertLess(len(text.encode("utf8")), 500 * 1024)

    def test_6m_graph_starts_on_sunday_ends_today_and_spans_26_weeks(self):
        today = date.fromisoformat(self.res["data"]["today"])
        days = self.res["data"]["contrib"]["days"]
        key, summary, start, end, words = graphs.graph_specs(self.res["data"], today)[0]
        self.assertEqual((key, summary, words), ("6m", None, "in the last 6 months"))
        self.assertEqual(start.weekday(), 6)
        self.assertEqual(end, today)
        cells = graphs.cells_of(days, start, end)
        self.assertEqual(graphs.ncols_of(cells, start), 26)

    def test_github_board_has_seven_icons_and_no_graph(self):
        for name in ("github", "github-phone"):
            svg = self.res["files"][f"assets/{name}-light.svg"]
            body = svg.split("</defs>")[1]
            self.assertEqual(body.count("scale("), 7, name)
            self.assertNotIn("Less", svg, name)
            self.assertNotIn("http", body.replace("http://www.w3.org/2000/svg", ""), name)   # nothing third party
        self.assertEqual(sorted(board.ICON_OF), sorted(["calendar", "flame", "trophy", "chart", "folder", "star", "download"]))

    def test_alt_text_carries_the_numbers(self):
        text = self.res["files"]["README.md"]
        c, r, x = self.res["data"]["contrib"], self.res["data"]["repos"], self.res["data"]["challenge"]
        for needle in (f"{c['last_year']:,} contributions in the last year", f"{r['public_repos']} public repos",
                       f"{r['stars']} stars earned", f"{x['count']:,}"):
            self.assertIn(needle, text)

    def test_every_picture_has_phone_sources_in_the_right_order(self):
        text = self.res["files"]["README.md"]
        data = self.res["data"]
        names = (["hero", "github", "whoami", "label-ship", "label-videos"] + [f"app-{a['id']}" for a in self.P["apps"]]
                 + [f"video-{v['id']}" for v in data["videos"]["videos"]])
        for name in names:
            m = re.search(r"<picture>((?:(?!</picture>).)*assets/%s-light\.svg.*?)</picture>" % re.escape(name), text)
            self.assertIsNotNone(m, name)
            media = re.findall(r'<source media="([^"]+)" srcset="([^"]+)"', m.group(1))
            self.assertEqual(media, [
                ("(prefers-color-scheme: dark) and (max-width: 600px)", f"assets/{name}-phone-dark.svg"),
                ("(max-width: 600px)", f"assets/{name}-phone-light.svg"),
                ("(prefers-color-scheme: dark)", f"assets/{name}-dark.svg")])
        # the image widths stay, so each app card and video tile keeps its own link
        self.assertEqual(len(re.findall(r'width="49%"', text)), 4)
        self.assertEqual(len(re.findall(r'width="32%"', text)), 3)
        for t in ("light", "dark"):
            for name in ("hero", "github", "whoami", "label-ship", "label-videos"):
                self.assertIn('width="440"', self.res["files"][f"assets/{name}-phone-{t}.svg"], name)
            for a in self.P["apps"]:
                self.assertIn('viewBox="0 0 440 236"', self.res["files"][f"assets/app-{a['id']}-phone-{t}.svg"])
            for v in data["videos"]["videos"]:
                self.assertIn('viewBox="0 0 292 280"', self.res["files"][f"assets/video-{v['id']}-phone-{t}.svg"])

    def test_phone_cards_use_big_type(self):
        svgs = build.make_assets(self.res["data"], self.P)
        floors = {"app-": 24, "video-": 30, "label-": 34}       # the fix round's floors for the pill, the title and the label
        for name, s in svgs.items():
            if "-phone-" in name:
                for prefix, floor in floors.items():
                    if name.startswith(prefix):
                        self.assertGreaterEqual(s.min_size, floor, f"{name} has text at {s.min_size}px")

    def test_phone_app_cards_keep_only_icon_name_and_status(self):
        for a in self.P["apps"]:
            svg = self.res["files"][f"assets/app-{a['id']}-phone-light.svg"]
            texts = re.findall(r"<text [^>]*>([^<]*)</text>", svg)
            self.assertEqual(" ".join(texts[:-1]), a["name"])          # the name, on one or two lines
            self.assertEqual(texts[-1], a.get("status_phone", a["status"]))
            self.assertLessEqual(len(texts), 3)
            sizes = [int(n) for n in re.findall(r'font-family="ZF"[^>]*font-size="(\d+)"', svg)]   # the name lines
            self.assertTrue(sizes and min(sizes) >= 44, sizes)
            self.assertNotIn(a["line"], svg.split("</defs>")[1])         # drawn parts only; the alt text keeps it

    def test_phone_video_title_is_cut_at_a_word_with_an_ellipsis(self):
        v = {"id": "x", "title": "How I set up many Claude Code agents to build one app at the same time", "date": "2026-11-01", "thumb": ""}
        svg = phone.video_phone("light", v).render()
        texts = re.findall(r"<text [^>]*>([^<]*)</text>", svg)
        self.assertEqual(len(texts), 2)
        self.assertTrue(texts[1].endswith("..."))
        words = v["title"].split()
        self.assertIn(texts[1][:-3].split()[-1], words)           # the last word is a whole word of the title
        short = phone.video_phone("light", {**v, "title": "A short title"}).render()
        self.assertEqual(re.findall(r"<text [^>]*>([^<]*)</text>", short), ["A short title"])

    def test_workflow_parses_and_does_what_the_plan_says(self):
        path = os.path.join(ROOT, ".github", "workflows", "nightly.yml")
        text = read(path)
        for needle in ("cron: \"17 2 * * *\"", "workflow_dispatch", "contents: write", "actions/checkout@v4",
                       "actions/setup-python@v5", "pip install -r scripts/requirements.txt", "python scripts/build.py",
                       "chore: nightly profile refresh", "git add assets README.md scripts/state.json"):
            self.assertIn(needle, text)
        try:
            import yaml
        except ImportError:
            self.skipTest("PyYAML is not installed; the workflow text was checked, not parsed")
        doc = yaml.safe_load(text)
        self.assertIn("schedule", doc[True])         # YAML 1.1 reads the key `on` as True
        self.assertEqual(doc["permissions"], {"contents": "write"})

    def test_no_long_dashes_in_the_files_we_wrote(self):
        names = [os.path.join(HERE, f) for f in os.listdir(HERE) if f.endswith(".py") and f != "test_build.py"]
        names += [os.path.join(ROOT, "profile.json"), os.path.join(DEV, "preview.py")]
        for path in names:
            text = read(path)
            for d in DASHES:
                self.assertNotIn(d, text, path)


if __name__ == "__main__":
    unittest.main()
