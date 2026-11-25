// The site's content. Every count starts at zero: one entry per day is appended to the
// active challenge as it happens.
window.SITE = {
  name: "ZazaG Dev",
  tagline: "One solo developer building and shipping my own apps, in public.",
  now: Date.now(), // the visitor's clock
  // page: the app's own page on this site; a click anywhere on its card opens it (#2122)
  projects: [
    { name: "Martva", page: "apps/martva/", status: "live", text: "Practice for the Georgian driving theory test: 1,572 official questions in 5 languages, fully offline.", logo: "img/martva.png",
      // A store badge per store the app is on (owner, task #160)
      stores: { apple: "https://apps.apple.com/us/app/martva-driving-license/id6795477065", google: "https://play.google.com/store/apps/details?id=com.martva.app" } },
    { name: "Doodlebay", page: "apps/doodlebay/", status: "open source", text: "A whiteboard for sketching ideas and scoreboards.", logo: "img/doodlebay.png", github: "https://github.com/ZazaGdev/Doodlebay" },
    { name: "Editbay", page: "apps/editbay/", status: "open source", text: "A free, open-source video editor for Windows (MIT licence). Every ZazaG Dev video is cut in it.", logo: "img/editbay.png", github: "https://github.com/ZazaGdev/editbay" },
    { name: "FocusShell", page: "apps/focusshell/", status: "open source", text: "Runs several Claude Code agents side by side, one pane per project.", logo: "img/agentdeck.png", github: "https://github.com/ZazaGdev/FocusShell" }
  ],
  // Long-term goals per platform (task #191): count targets with no deadline, drawn as a road on goals/ only.
  // pid is the platform's count id in the active challenge; a goal is reached on the first logged day its count
  // gets there. A target can also be { t: 500, reached: "YYYY-MM-DD" } for one reached before the site tracked it.
  // Targets set by the owner on 2026-10-12.
  goals: [
    { pid: "yt", targets: [{ t: 25, reached: "2026-10-10" }, 100, 250, 500, 1000, 2500, 5000, 10000] }, // 25 reached 2026-10-10 (owner)
    // #3058: while no challenge runs, now and asOf hold the owner's latest count by hand (goals/ shows it instead of the
    // last logged day's); a stop that only this count passes is reached on asOf
    { pid: "x", now: 2664, asOf: "2026-11-19", targets: [100, 250, 500, 1000, { t: 2500, reached: "2026-11-19" }, 5000, 10000] }, // 2,500 crossed between 18 and 19 Nov (#3088)
    { pid: "li", now: 1715, asOf: "2026-11-18", targets: [1500, 2000, 2500, 3000, 4000, 5000, 10000] },
    { pid: "rd", now: 322, asOf: "2026-11-18", targets: [100, 250, 500, 1000, 2500, 5000, 10000] },
    // MRR (owner, 2026-10-12): not a challenge count, so its current number is kept here and updated by hand.
    // now: the real figure, $0 (owner, 2026-10-13); the daily update sets it with --mrr only when it changes. A reached target gets { t, reached: "YYYY-MM-DD" }.
    { id: "mrr", name: "MRR", label: "monthly recurring revenue", money: true, now: 0, targets: [100, 250, 500, 1000, 2500, 5000, 10000] }
  ],
  challenges: [
    {
      id: "30-days", title: "30 days of building in public", status: "completed", // finished on 2026-11-10 (#2819)
      summary: "2 long videos and 2 Shorts on YouTube and an app release every week, posts on LinkedIn, X and Reddit every day, and 8,000 steps, workouts and reading for me. Every evening I tick off the day here.",
      start: "2026-10-12", days: 30, lastUpdate: "2026-11-10T22:25:10.882Z", // set with each day's entry
      // #1129: platforms paused on purpose, written by log-day.mjs --pause / --end-pause. Days from..to (to: null while on) count as neither done nor missed.
      pauses: [
      ],
      goals: [
        // plat: the platform card a goal sits in on the calendar; a goal with no plat goes in "Personal".
        // A counted goal (comments, steps) keeps the day's number in the entry's n.
        { id: "yt", plat: "YouTube", name: "Long videos", label: "Long video", kind: "Long video", short: "YT", rule: "2 a week", per: "week", target: 2 },
        { id: "yt-s", plat: "YouTube", name: "Short", label: "Short", kind: "Short", short: "YT S", rule: "2 a week", per: "week", target: 2 },
        { id: "app", plat: "Build", name: "App release", label: "App release or deployment", kind: "Release or deploy an app", short: "APP", rule: "1 a week", per: "week", target: 1 },
        { id: "li", plat: "LinkedIn", name: "LinkedIn post", label: "LinkedIn post", kind: "Post", short: "LI", rule: "1 a day", per: "day", target: 1 },
        { id: "li-c", plat: "LinkedIn", name: "LinkedIn comments", label: "LinkedIn comments", kind: "Comment", short: "LI C", rule: "5 a day", per: "day", target: 5 },
        { id: "li-r", plat: "LinkedIn", name: "Connection requests", label: "Connection requests", kind: "Send connection requests", short: "LI R", rule: "10 a day", per: "day", target: 10 },
        // #2055: changes is a goal's new target from a day on; earlier days keep the old one (owner, 2026-10-29)
        { id: "x", plat: "X", name: "X posts", label: "X posts", kind: "Post", short: "X", rule: "3 a day", per: "day", target: 3,
          changes: [{ from: 17, target: 2, rule: "2 a day", note: "X goal cut from 3 to 2 posts a day, because 3 a day was hurting my profile more than helping." }] },
        { id: "x-r", plat: "X", name: "X replies", label: "X replies", kind: "Reply", short: "X R", rule: "5 a day", per: "day", target: 5 },
        { id: "rd", plat: "Reddit", name: "Reddit post", label: "Reddit post", kind: "Post", short: "RD", rule: "1 a day", per: "day", target: 1 },
        { id: "rd-c", plat: "Reddit", name: "Reddit comments", label: "Reddit comments", kind: "Comment", short: "RD C", rule: "5 a day", per: "day", target: 5 },
        // Personal goals, not tied to a platform.
        { id: "steps", name: "8,000 steps", label: "8,000 steps", kind: "Walk 8,000 steps", short: "STEPS", rule: "every day", per: "day", target: 8000, unit: "steps" },
        { id: "gym", name: "Work out", label: "Workout", kind: "Work out", short: "GYM", rule: "4 times a week", per: "week", target: 4 },
        { id: "read", name: "Read", label: "Reading", kind: "Read for 20 minutes", short: "READ", rule: "every day", per: "day", target: 1 }
      ],
      // start: the count before day 1, shown until the first entry (owner's numbers, 2026-10-11). Edit them here.
      // url: the owner's profile; the Followers card opens it in a new tab (#194).
      // miles: extra milestone steps for one platform. one: the label when the count is 1. extra: a second, smaller number in the same card; a day's entry
      // can carry it in counts under its id.
      platforms: [
        { id: "yt", name: "YouTube", label: "subscribers", one: "subscriber", url: "https://www.youtube.com/@zazagdev", start: 27, extra: { id: "yt-views", label: "views", start: 326 } },
        { id: "x", name: "X", label: "followers", one: "follower", url: "https://x.com/ZazaGDev", start: 1 },
        { id: "li", name: "LinkedIn", label: "followers", one: "follower", url: "https://www.linkedin.com/in/zaza-gejadze-48b248226/", start: 1366, miles: [1500, 2000] }, // milestones 1,500 (owner, 2026-10-18, #1007) and 2,000 (owner, 2026-10-11)
        { id: "rd", name: "Reddit", label: "karma", url: "https://www.reddit.com/user/BuildinZZ", start: 1, extra: { id: "rd-followers", label: "followers", start: 0 } }
      ],
      // One entry per day: goals done, what was done, and end-of-day counts. A missed day is an entry with nothing done (no skips, owner 2026-10-11).
      entries: [
        {"day":1,"done":["li","rd","read"],"n":{"li-c":6,"li-r":10,"x":3,"x-r":7,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/dDNEqCDu","x":"https://x.com/GejadzeZaza/status/2109717304862724235"},"note":"Day 1. The kickoff post is up on LinkedIn.","counts":{"yt":28,"yt-views":563,"x":20,"li":1377,"rd":1,"rd-followers":1}},
        {"day":2,"done":["li","rd","gym","read"],"n":{"li-c":5,"li-r":11,"x":4,"x-r":5,"rd-c":5,"steps":8000},"links":{"x":"https://x.com/GejadzeZaza/status/2110085262722359480","li":"https://lnkd.in/p/dj58-EZi"},"note":"Day 2: mapped my whole Claude Code setup in 3D and it found two real problems, which are now fixed.","counts":{"yt":28,"yt-views":722,"x":53,"li":1382,"rd":4,"rd-followers":1}},
        {"day":3,"done":["yt-s","li","rd-s","read","rd"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"yt-s":"https://www.youtube.com/shorts/5ZPqDhN-WgQ","li":"https://lnkd.in/p/db5ZfNkJ","x":"https://x.com/ZazaGDev/status/2110455859163922465","rd":"https://www.reddit.com/r/u_BuildinZZ/comments/1x613bs/my_claude_code_self_improvement_loop/","rd-s":"https://www.reddit.com/r/ClaudeAI/comments/1x5yl6n/claude_code_self_improvement/"},"note":"Day 3: shared how I get Claude Code to improve itself every week, on LinkedIn, X and Reddit.","counts":{"yt":29,"yt-views":863,"x":151,"li":1394,"rd":12,"rd-followers":1}},
        {"day":4,"done":["yt","li","rd","gym","read","yt-s","rd-s"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"yt":"https://www.youtube.com/watch?v=6kKdTCxHmkE","yt-s":"https://www.youtube.com/shorts/I0eweNou6HE","li":"https://lnkd.in/p/dh23xvyN","x":"https://x.com/ZazaGDev/status/2110709804176207954","rd-s":"https://www.reddit.com/r/ClaudeCode/comments/1x6o5ml/what_stack_and_claude_code_setup_do_you_use_to/"},"note":"Day 4: the HousePlanner video is up, a hand-drawn floor plan turned into a 3D house you can edit. Also posted about Anthropic's self-replicating AI research.","counts":{"yt":29,"yt-views":982,"x":160,"li":1409,"rd":18,"rd-followers":1}},
        {"day":5,"done":["li","rd","read"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/gpSwvjpD","x":"https://x.com/ZazaGDev/status/2111100507599384812"},"note":"Day 5: a first look at AgentDeck, the desktop app I built to run Claude Code across my projects. Open source on October 18.","counts":{"yt":29,"yt-views":1182,"x":161,"li":1416,"rd":19,"rd-followers":1}},
        {"day":6,"done":["yt-s","li","rd","rd-s","gym","read"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"yt-s":"https://youtube.com/shorts/SmqtJ_jkqVE","li":"https://lnkd.in/p/dEtXk6Tv","x":"https://x.com/ZazaGDev/status/2111579807511400542","rd-s":"https://www.reddit.com/r/ClaudeCode/s/q2HmHXdufQ"},"note":"Made a 36-second explainer on prompt caching, the first in a How AI works series.","link":"https://youtube.com/shorts/SmqtJ_jkqVE","counts":{"yt":29,"yt-views":1596,"x":169,"li":1426,"rd":48,"rd-followers":1}},
        {"day":7,"done":["yt","app","li","rd","gym","read","yt-s","rd-s"],"n":{"li-c":5,"li-r":10,"x":1,"x-r":5,"rd-c":5,"steps":3000},"links":{"yt":"https://youtu.be/t_WVO-hzF2w","app":"https://github.com/ZazaGdev/FocusShell","rd-s":"https://www.reddit.com/r/ClaudeCode/comments/1x8mpei/do_you_let_claude_do_all_the_coding_now/"},"note":"Everything done except steps. Damn that app release, I worked 12h that day.","why":{"steps":"Missed steps: the app release kept me at the desk for 12h.","x":"Missed X: my account was shadow-banned."},"counts":{"yt":32,"yt-views":2005,"x":167,"li":1432,"rd":183,"rd-followers":1}},
        {"day":8,"done":["li","rd","read"],"n":{"li-c":5,"li-r":10,"x":1,"x-r":5,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/dcfQAw_a","x":"https://x.com/ZazaGDev/status/2112248773858730468","rd":"https://www.reddit.com/u/BuildinZZ/s/WVmq9SIAEz"},"note":"Posted a LinkedIn carousel on REA, the reverse engineering tool everyone is talking about, and FocusShell got its first GitHub stars.","link":"https://lnkd.in/p/dcfQAw_a","why":{"x":"Missed X: my account was shadow-banned."},"counts":{"yt":32,"yt-views":2461,"x":170,"li":1444,"rd":210,"rd-followers":1}},
        {"day":9,"done":["yt-s","li","rd","read"],"n":{"li-c":5,"li-r":10,"x":1,"x-r":1,"rd-c":5,"steps":8000},"links":{"yt-s":"https://youtube.com/shorts/JnG_vtOI74k","rd":"https://www.reddit.com/r/AppIdeas/comments/1xavlw6/running_coding_agents_in_several_projects_at_once/"},"note":"Every daily goal done except X.","why":{"x":"Missed X: my account was shadow-banned.","x-r":"Missed X: my account was shadow-banned."},"counts":{"yt":33,"yt-views":2584,"x":169,"li":1460,"rd":219,"rd-followers":1}},
        {"day":10,"done":["yt-s","li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":1,"rd-c":5,"steps":8000},"links":{"yt-s":"https://www.youtube.com/shorts/bHzlOVRavDg","li":"https://lnkd.in/p/dvcYFVfh","x":"https://x.com/ZazaGDev/status/2112989365706133798","rd":"https://www.reddit.com/u/BuildinZZ/s/63cdvZySGa"},"note":"Every daily goal done except X again.","why":{"x":"Missed X: my account was shadow-banned.","x-r":"Missed X: my account was shadow-banned."},"counts":{"yt":36,"yt-views":2911,"x":170,"li":1476,"rd":219,"rd-followers":1}},
        {"day":11,"done":["yt","li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"yt":"https://www.youtube.com/watch?v=G-I5YSrhsy8","li":"https://lnkd.in/p/dJmkGmKQ","x":"https://x.com/ZazaGDev/status/2113229110428553266"},"note":"Every daily goal done, X included, plus an interval workout and a new long video: vibe coding a mobile game about vibe coding.","link":"https://www.youtube.com/watch?v=G-I5YSrhsy8","counts":{"yt":38,"yt-views":3061,"x":239,"li":1485,"rd":220,"rd-followers":1}},
        {"day":12,"done":["li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/dJxt2Yh6","x":"https://x.com/ZazaGDev/status/2113642313008501147","rd":"https://www.reddit.com/r/indiegames/comments/1xdhkd5/im_making_a_pixelart_game_about_programmer_life/"},"note":"Every daily goal done except X (2 of 3 posts), plus a workout. Shared Programmer Simulator, my pixel-art game about programmer life, on r/indiegames.","link":"https://www.reddit.com/r/indiegames/comments/1xdhkd5/im_making_a_pixelart_game_about_programmer_life/","counts":{"yt":39,"yt-views":3294,"x":302,"li":1491,"rd":222,"rd-followers":1}},
        {"day":13,"done":[],"n":{"steps":8000},"note":"Day off for a friend's wedding.","stamp":{"text":"Friend's wedding","seal":"Day off"},"counts":{"yt":39,"yt-views":3294,"x":302,"li":1491,"rd":222,"rd-followers":1}},
        {"day":14,"done":["yt","yt-s","li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"rd-c":5},"links":{"yt":"https://www.youtube.com/watch?v=Lzcbghebw3s","yt-s":"https://www.youtube.com/shorts/L4W4OwbNsqw","li":"https://lnkd.in/p/dw_-2JEf","rd":"https://www.reddit.com/r/IndieGaming/s/VfObbyw761"},"note":"Published the My AI setup video and a Programmer Simulator Short, and asked r/IndieGaming for feedback on the game.","link":"https://www.youtube.com/watch?v=Lzcbghebw3s","counts":{"yt":39,"yt-views":3555,"x":365,"li":1506,"rd":224,"rd-followers":1}},
        {"day":15,"done":["li","rd","read"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"rd":"https://www.reddit.com/r/incremental_games/comments/1xgc18g/taking_suggestions_on_tycoonsimulation_type_of/","x":"https://x.com/ZazaGDev/status/2114712126648377787"},"note":"All dailies done.","counts":{"yt":39,"yt-views":3555,"x":469,"li":1514,"rd":227,"rd-followers":1}},
        {"day":16,"done":["yt-s","li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":3,"x-r":5,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/dJTbgkhA","rd":"https://www.reddit.com/r/gamedev/comments/1xgr3pd/where_should_i_start_learning_unity_blender/","yt-s":"https://youtube.com/shorts/Es5I4_vW1QQ"},"note":"X followers are climbing at crazy speed, 589 now.","counts":{"yt":40,"yt-views":3649,"x":589,"li":1522,"rd":244,"rd-followers":1}},
        {"day":17,"done":["li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"rd-c":5,"steps":8000},"links":{"x":"https://x.com/ZazaGDev/status/2115374221576597808","rd":"https://www.reddit.com/u/BuildinZZ/s/IKlgFH1ohY"},"note":"Every daily goal done, plus a workout. X passed 600 followers.","counts":{"yt":42,"yt-views":3699,"x":658,"li":1531,"rd":245,"rd-followers":1}},
        {"day":18,"done":["yt","li","gym","read","rd"],"n":{"li-c":6,"li-r":11,"x":2,"x-r":5,"rd-c":5,"steps":8000},"links":{"yt":"https://www.youtube.com/watch?v=FyE-mLvAvmw","li":"https://lnkd.in/p/dEs459xq","x":"https://x.com/ZazaGDev/status/2115915439352004851","rd":"https://www.reddit.com/user/BuildinZZ/comments/1xj1h6v/cat_types_in_my_very_first_mobile_game/"},"note":"Long video out: Code, Ship, Sleep, Repeat! X passed 680 followers.","link":"https://www.youtube.com/watch?v=FyE-mLvAvmw","counts":{"yt":42,"yt-views":3755,"x":681,"li":1544,"rd":248,"rd-followers":1}},
        {"day":19,"done":["yt-s","li","rd","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"rd-c":5,"steps":8000},"links":{"rd":"https://www.reddit.com/r/DestroyMyGame/comments/1xje57e/destroy_my_cozy_tycoon_about_programmer_life/"},"note":"Showntask page is live on zazag.dev, launching Sunday.","counts":{"yt":44,"yt-views":3762,"x":728,"li":1555,"rd":250,"rd-followers":1}},
        {"day":20,"done":["li","rd"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/d9ggcuzV","x":"https://x.com/ZazaGDev/status/2116429434324685275","rd":"https://www.reddit.com/r/iOSProgramming/comments/1xk5t3g/how_do_you_handle_report_a_bug_in_an_iphone_app/"},"note":"Asked r/iOSProgramming how they handle Report a bug in an iPhone app.","counts":{"yt":45,"yt-views":4009,"x":754,"li":1565,"rd":259,"rd-followers":1}},
        {"day":21,"done":["li","gym","read","yt-s"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":5,"steps":3000},"links":{"li":"https://lnkd.in/p/dYduchfs","x":"https://x.com/ZazaGDev/status/2116832321181544606","yt-s":"https://www.youtube.com/shorts/aOOYyQm7Amg"},"note":"Asked r/iOSProgramming how they handle Report a bug in an iPhone app.","counts":{"yt":45,"yt-views":4009,"x":884,"li":1565,"rd":260,"rd-followers":1}},
        {"day":22,"done":["read","li","x","rd","steps"],"n":{"li-c":5,"li-r":10,"x":1,"x-r":5,"rd-c":5},"links":{"rd":"https://www.reddit.com/r/iOSProgramming/comments/1xmalja/what_tripped_you_up_publishing_your_first_ios_app/"},"note":"Asked r/iOSProgramming what tripped them up publishing a first iOS app with in-app purchases.","link":"https://www.reddit.com/r/iOSProgramming/comments/1xmalja/what_tripped_you_up_publishing_your_first_ios_app/","counts":{"yt":45,"yt-views":4075,"x":954,"li":1574,"rd":261,"rd-followers":1}},
        {"day":23,"done":["li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":20,"rd-c":5,"steps":8000},"links":{"li":"https://lnkd.in/p/dUkRwfWj","x":"https://x.com/ZazaGDev/status/2117390604200259772","rd":"https://www.reddit.com/r/Sakartvelo/comments/1xmv5wb/studying_for_the_driving_theory_exam_i_made_a/"},"note":"Posted three weeks of challenge progress on LinkedIn and X, and shared Martva, the free driving theory practice app, on r/Sakartvelo and r/tbilisi. X passed 990 followers.","link":"https://lnkd.in/p/dUkRwfWj","counts":{"yt":45,"yt-views":4270,"x":990,"li":1594,"rd":270,"rd-followers":1}},
        {"day":24,"done":["li","rd","gym","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":12,"rd-c":5,"steps":8000},"links":{"x":"https://x.com/ZazaGDev/status/2117688798226055270","rd":"https://www.reddit.com/r/iOSProgramming/comments/1xnrg82/software_dev_and_lifelong_gamer_starting_ios_game/"},"note":"X passed 1,000 followers on day 24. The game is close to App Store submission, and I asked r/iOSProgramming for advice.","link":"https://x.com/ZazaGDev/status/2117941651238731950","counts":{"yt":47,"yt-views":4361,"x":1056,"li":1604,"rd":277,"rd-followers":1}},
        {"day":25,"done":["li","rd","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":31,"rd-c":5,"steps":3000},"links":{"x":["https://x.com/ZazaGDev/status/2118429031775527353","https://x.com/ZazaGDev/status/2118252991149232443"],"li":"https://lnkd.in/p/djj2GBqX","rd":"https://www.reddit.com/r/ClaudeCode/comments/1xof7dd/what_are_your_most_used_mcpsskills/"},"note":"Submitted Programmer Simulator 1.0 to the App Store, now waiting for review. X grew by 163 followers in 48 hours.","link":"https://x.com/ZazaGDev/status/2118429031775527353","counts":{"yt":48,"yt-views":4361,"x":1153,"li":1617,"rd":293,"rd-followers":1}},
        {"day":26,"done":["yt-s","app","li","rd","read"],"n":{"li-c":6,"li-r":10,"x":2,"x-r":31,"rd-c":5},"links":{"yt-s":"https://youtube.com/shorts/B3FzNbiw3_Q","li":"https://lnkd.in/p/d9MhPuMV","x":"https://x.com/ZazaGDev/status/2118698744933732538","rd":"https://www.reddit.com/r/Entrepreneurs/comments/1xp9192/i_keep_hearing_think_like_a_marketer_not_a/"},"note":"New Short is up. X grew by 184 followers in a day, to 1,337.","link":"https://youtube.com/shorts/B3FzNbiw3_Q","counts":{"yt":49,"yt-views":4424,"x":1337,"li":1628,"rd":298,"rd-followers":1}},
        {"day":27,"done":["li","rd"],"n":{"li-c":6,"li-r":11,"x":2,"x-r":15,"rd-c":5},"links":{"x":["https://x.com/ZazaGDev/status/2119045090903744986","https://x.com/ZazaGDev/status/2119069552151539951"],"li":"https://lnkd.in/p/dk2nMa_B","rd":"https://www.reddit.com/r/ClaudeCode/comments/1xq7nqn/when_to_use_ultracode_and_how_token_hungry_is_it/"},"note":"Asked r/ClaudeCode when ultracode is worth it and how token hungry it is. X reached 1,389 followers.","link":"https://www.reddit.com/r/ClaudeCode/comments/1xq7nqn/when_to_use_ultracode_and_how_token_hungry_is_it/","counts":{"yt":50,"yt-views":4636,"x":1389,"li":1634,"rd":304,"rd-followers":1}},
        {"day":28,"done":["li","rd","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":44,"rd-c":5},"links":{"x":["https://x.com/ZazaGDev/status/2119391863002247565","https://x.com/ZazaGDev/status/2119437208411078766"],"li":"https://lnkd.in/p/dmexq-G5","rd":"https://www.reddit.com/r/buildinpublic/comments/1xr61p9/growing_on_x_twitter/"},"note":"Shared Editbay for Mac on LinkedIn and asked r/buildinpublic about growing on X. X reached 1,483 followers.","link":"https://lnkd.in/p/dmexq-G5","counts":{"yt":50,"yt-views":4658,"x":1483,"li":1641,"rd":306,"rd-followers":1}},
        {"day":29,"done":["li","rd","read"],"n":{"li-c":5,"li-r":12,"x":3,"x-r":26,"rd-c":5,"steps":8000},"links":{"x":["https://x.com/ZazaGDev/status/2119736291738697878","https://x.com/ZazaGDev/status/2119747738740961703"],"li":"https://lnkd.in/p/dyDdkPtM","rd":"https://www.reddit.com/r/claudeskills/comments/1xruhg5/a_claude_skill_that_tells_you_what_your_claude/"},"note":"Posted about Discord moving to Rust on LinkedIn and X, and shared the api-bill skill in r/claudeskills. X reached 1,584 followers.","link":"https://www.reddit.com/r/claudeskills/comments/1xruhg5/a_claude_skill_that_tells_you_what_your_claude/","counts":{"yt":51,"yt-views":4694,"x":1584,"li":1652,"rd":306,"rd-followers":2}},
        {"day":30,"done":["app","li","rd","read"],"n":{"li-c":5,"li-r":10,"x":2,"x-r":38,"rd-c":5,"steps":8000},"links":{"app":["https://github.com/ZazaGdev/FocusShell/releases/tag/v2.0.0","https://github.com/ZazaGdev/editbay/releases/tag/v2.1"],"li":"https://lnkd.in/p/dsGaHeJ4","x":["https://x.com/ZazaGDev/status/2120186316629631398","https://x.com/ZazaGDev/status/2120112893547151604"],"rd":"https://www.reddit.com/r/SocialMediaMarketing/comments/1xsvih8/growing_on_x_twitter/"},"note":"Last day of the 30 day challenge and I just crossed 1,700 followers on X.","link":"https://x.com/ZazaGDev/status/2120186316629631398","why":{"gym":"Missed workouts: rest week, shoulder injury."},"counts":{"yt":51,"yt-views":4713,"x":1736,"li":1661,"rd":307,"rd-followers":2}}
      ]
    },
    // #3088: Road to 10,000 on X, from Fri 20 Nov to Thu 31 Dec 2026 (owner, 2026-11-19). target is the follower goal the road card
    // and the challenge tile draw (pid: the platform whose count it is, n: the number).
    { id: "x", title: "Road to 10,000 on X", status: "active",
      summary: "10,000 followers on X by Dec 31. Every day: at least 5 posts and 200 replies.",
      start: "2026-11-20", days: 42, lastUpdate: "2026-11-23T23:26:07.159Z",
      target: { pid: "x", n: 10000 },
      goals: [
        { id: "x", plat: "X", name: "X posts", label: "X posts", kind: "Post", short: "X", rule: "5 a day", per: "day", target: 5 },
        { id: "x-r", plat: "X", name: "X replies", label: "X replies", kind: "Reply", short: "X R", rule: "200 a day", per: "day", target: 200 }
      ],
      platforms: [
        { id: "x", name: "X", label: "followers", one: "follower", url: "https://x.com/ZazaGDev", start: 2664 }
      ],
      entries: [
        {"day":1,"done":[],"n":{"x":5,"x-r":295},"links":{"x":["https://x.com/ZazaGDev/status/2123736497467891958","https://x.com/ZazaGDev/status/2123769822248935636","https://x.com/ZazaGDev/status/2123806194200612901","https://x.com/ZazaGDev/status/2123855269612462315","https://x.com/ZazaGDev/status/2123875150739492868"]},"note":"41 days left in 2026.","counts":{"x":2906}},
        {"day":2,"done":[],"n":{"x":5,"x-r":269},"links":{"x":["https://x.com/ZazaGDev/status/2124059815383117980","https://x.com/ZazaGDev/status/2124099503993028778","https://x.com/ZazaGDev/status/2124188218924933500","https://x.com/ZazaGDev/status/2124275873859727414","https://x.com/ZazaGDev/status/2124286785651945746"]},"note":"40 days left in 2026.","counts":{"x":3008}},
        {"day":3,"done":[],"n":{"x":5,"x-r":275},"links":{"x":["https://x.com/ZazaGDev/status/2124472137582854444","https://x.com/ZazaGDev/status/2124521495829561697","https://x.com/ZazaGDev/status/2124561090788966767","https://x.com/ZazaGDev/status/2124566651723231500","https://x.com/ZazaGDev/status/2124602109827949014"]},"note":"39 days left in 2026.","counts":{"x":3111}},
        {"day":4,"done":[],"n":{"x":5,"x-r":279},"links":{"x":["https://x.com/ZazaGDev/status/2124821814560059531","https://x.com/ZazaGDev/status/2124889487020880171","https://x.com/ZazaGDev/status/2124974901677195298","https://x.com/ZazaGDev/status/2124996317999247804","https://x.com/ZazaGDev/status/2124998030860362042"]},"note":"38 days left in 2026.","counts":{"x":3216}}
      ] },
    { id: "warm-up", title: "7-day posting warm-up", status: "completed", start: "2026-10-05", days: 7, // ended 2026-10-11
      summary: "One post a day for a week before the big one." }
  ]
};

window.CH = {
  esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); },
  // Render a markup string built only from escaped values into an element.
  // A page without that section (the home page dropped its Daily log in #2125) is left alone
  render(id, markup) { const el = document.getElementById(id); if (el) el.replaceChildren(document.createRange().createContextualFragment(markup)); },
  fmt(n) { return n.toLocaleString("en-US"); },
  signed(n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + Math.abs(n).toLocaleString("en-US"); },
  active() { return SITE.challenges.find(c => c.status === "active"); },
  // #2819: the challenge a page is about: the page's own (window.CHALLENGE_ID), else the running one, else the latest
  // one that has a log. Scripts use this so nothing throws when no challenge is running.
  current() {
    const id = window.CHALLENGE_ID, own = id && SITE.challenges.find(c => c.id === id);
    return own || CH.active() || SITE.challenges.filter(c => (c.entries || []).length).sort((a, b) => b.start.localeCompare(a.start))[0];
  },
  // "Today" for a page: the challenge day while it runs, else the number of logged days
  lastDay(c) { return c.status === "active" ? CH.today(c) : (c.entries || []).length; },
  dateOf(c, day) { const d = new Date(c.start + "T12:00:00"); d.setDate(d.getDate() + day - 1); return d; },
  md(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }); },
  wd(d) { return d.toLocaleDateString("en-US", { weekday: "short" }); },
  // The challenge day from the date in Tbilisi (UTC+4, no daylight saving): day 1 from 00:00 on the start date,
  // 0 before it, never past the last day. Logged entries fill in each day's content.
  TZ: "Asia/Tbilisi",
  tbilisiDate(ms) { return new Date(ms + 4 * 3600000).toISOString().slice(0, 10); },
  today(c) {
    const d = Math.round((Date.parse(CH.tbilisiDate(SITE.now)) - Date.parse(c.start)) / 86400000) + 1;
    return Math.max(0, Math.min(c.days, d));
  },
  // The parent groups the calendar uses: a goal's plat, or "Personal" last. Same names and tints as cal-platform.js.
  GROUP_TINT: { YouTube: "var(--yt)", LinkedIn: "var(--lx)", X: "var(--x)", Reddit: "var(--rd)", Build: "var(--bd)", Personal: "var(--li)" },
  groups(c) {
    const names = [...new Set((c.goals || []).map(g => g.plat || "Personal"))].sort((a, b) => (a === "Personal") - (b === "Personal"));
    return names.map(name => ({ name, tint: CH.GROUP_TINT[name] || "var(--x)", goals: c.goals.filter(g => (g.plat || "Personal") === name) }));
  },
  // The post a done goal links to that day (entry.links, e.g. { li: "https://lnkd.in/..." }), or "" when it has none.
  link(en, id) { return CH.links(en, id)[0] || ""; },
  // #2576: every post a goal links to that day, first one first; entry.links[id] is one link or a list of them
  links(en, id) { const u = en && en.links && en.links[id]; return [].concat(u || []).filter(x => typeof x === "string" && /^https:\/\//.test(x)); },
  // A goal counts as done that day when ticked, or when a counted goal reached its target.
  doneOn(c, g, en) { return !!en && (en.done.includes(g.id) || (!!en.n && en.n[g.id] >= CH.goalOn(g, en.day).target)); },
  // #2055: a goal as it stood on a day: a change (goal.changes) from that day on gives its target and rule
  goalOn(g, day) { const ch = (g.changes || []).filter(x => day >= x.from).pop(); return ch ? { ...g, target: ch.target, rule: ch.rule } : g; },
  // The change that started in days a..b, or undefined
  changeIn(g, a, b) { return (g.changes || []).find(x => x.from >= a && x.from <= b); },
  // A log entry's goals as chips under their group names; groups with nothing done are left out.
  logChips(c, en) {
    const e = CH.esc;
    const parts = CH.groups(c).map(gr => {
      // A goal with a post link has no chip of its own: the platform chip itself opens the post (owner, #194)
      // A linked post counts even when its goal is not met yet (1 of 3 X posts still opens that post)
      const done = gr.goals.filter(g => CH.doneOn(c, g, en)), url = gr.goals.map(g => CH.link(en, g.id)).find(Boolean);
      if (!done.length && !url) return "";
      const chips = done.filter(g => !CH.link(en, g.id)).map(g => `<span class="chip">${e(g.short)}</span>`).join("");
      // #2576: a goal's further posts that day get a small numbered chip each, after the platform chip
      const more = gr.goals.flatMap(g => CH.links(en, g.id).slice(1)).map((u, i) => `<a class="lg lg-more" style="--tint:${gr.tint}" href="${e(u)}" target="_blank" rel="noopener" aria-label="Open ${e(gr.name)} post ${i + 2}"><b>${i + 2} &#8599;</b></a>`).join("");
      return url ? `<a class="lg" style="--tint:${gr.tint}" href="${e(url)}" target="_blank" rel="noopener"><b>${e(gr.name)} &#8599;</b>${chips}</a>${more}`
        : `<span class="lg" style="--tint:${gr.tint}"><b>${e(gr.name)}</b>${chips}</span>`;
    }).join("");
    return parts || `<span class="chip">missed</span>`;
  },
  // #2842: same rule as doneOn, so a counted goal that reached its target counts as done
  did(c, goalId, day) { const e = c.entries[day - 1], g = (c.goals || []).find(x => x.id === goalId); return !!e && (g ? CH.doneOn(c, g, e) : e.done.includes(goalId)); },
  streak(c, goalId) { let s = 0; for (let d = c.entries.length; d >= 1 && CH.did(c, goalId, d); d--) s++; return s; },
  series(c, pid) {
    const p = (c.platforms || []).find(q => q.id === pid) || {}, base = p.start || 0;
    return c.entries.length ? c.entries.map(e => e.counts[pid] ?? base) : [base];
  },
  // #3088: where to read a platform that the running challenge may not have (Road to 10,000 on X counts only X): the challenge
  // itself when it has the platform, else the latest challenge with a log that has it (YouTube: the 30-day log)
  platformHome(c, pid) {
    if ((c.platforms || []).some(p => p.id === pid)) return c;
    return SITE.challenges.filter(x => (x.entries || []).length && (x.platforms || []).some(p => p.id === pid)).sort((a, b) => a.start.localeCompare(b.start)).pop() || null;
  },
  // The count the Goals page and the home follow strip show: the hand-kept now in SITE.goals (#3058) for a platform the running
  // challenge does not have or while none runs, else the last logged count. null when no challenge ever had the platform.
  countOf(c, pid) {
    const home = CH.platformHome(c, pid);
    if (!home) return null;
    const g = (SITE.goals || []).find(x => x.pid === pid), s = CH.series(home, pid);
    return g && g.now != null && (home !== c || c.status !== "active") ? g.now : s[s.length - 1];
  },
  // A platform card's label for a count: singular for exactly 1
  countLabel(p, n) { return n === 1 && p.one ? p.one : p.label; },
  // A platform card's small second number, such as YouTube views: the latest entry's, else the starting one
  extraText(c, p) {
    if (!p.extra) return "";
    const en = c.entries[c.entries.length - 1], n = en && en.counts[p.extra.id] != null ? en.counts[p.extra.id] : p.extra.start || 0;
    return `<small class="ex">${CH.fmt(n)} ${CH.esc(p.extra.label)}</small>`;
  },
  // #210: a follower card's growth: "from <start> +N" and a line chart over the whole challenge, the start at the left edge,
  // each logged day at its place along the 30 days, a dot on the latest value, the start and latest numbers under it.
  growth(c, p) {
    const e = CH.esc, start = p.start || 0, pts = [[0, start], ...c.entries.map(en => [en.day, en.counts[p.id] ?? start])];
    const now = pts[pts.length - 1][1], vals = pts.map(q => q[1]), min = Math.min(...vals), max = Math.max(...vals), span = max - min;
    const x = d => (d / c.days) * 100, y = v => span ? 31 - ((v - min) / span) * 26 : 18;
    const line = pts.map(([d, v]) => `${x(d).toFixed(2)},${y(v).toFixed(2)}`).join(" "), [ld, lv] = pts[pts.length - 1];
    return `<span class="d" title="since the challenge started">from ${CH.fmt(start)} &middot; ${CH.signed(now - start)}</span>
    <svg class="gchart" viewBox="0 0 100 36" preserveAspectRatio="none" role="img" aria-label="${e(p.name)}: ${CH.fmt(start)} at the start, ${CH.fmt(now)} on day ${ld}">
      <line class="gbase" x1="0" y1="35" x2="100" y2="35" vector-effect="non-scaling-stroke"/>
      <polyline points="${line}" vector-effect="non-scaling-stroke"/><polyline class="gdot" points="${x(0)},${y(start)} ${x(0)},${y(start)}" vector-effect="non-scaling-stroke"/>
      <polyline class="gdot now" points="${x(ld)},${y(lv)} ${x(ld)},${y(lv)}" vector-effect="non-scaling-stroke"/></svg>
    <span class="gends"><span>${CH.fmt(start)} start</span><span>day ${c.days}</span></span>`;
  },
  spark(values, w, h) {
    if (values.length < 2) return `0,${h} ${w},${h}`;
    const min = Math.min(...values), max = Math.max(...values), span = max - min || 1;
    return values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / span) * h}`).join(" ");
  },
  ago(iso) {
    const m = Math.round((new Date(SITE.now) - new Date(iso)) / 60000);
    return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
  },
  stamp(iso) {
    const f = o => new Date(iso).toLocaleString("en-US", { timeZone: CH.TZ, ...o });
    return `${f({ weekday: "short" })} ${f({ month: "short", day: "numeric" })}, ${f({ hour: "2-digit", minute: "2-digit", hourCycle: "h23" })} Tbilisi time`;
  },
  initTheme() {
    try { const s = localStorage.getItem("demo-theme"); if (s) document.documentElement.dataset.theme = s; } catch {}
    document.querySelectorAll("[data-toggle-theme]").forEach(b => b.addEventListener("click", () => {
      const dark = getComputedStyle(document.documentElement).getPropertyValue("--is-dark").trim() === "1";
      const next = dark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("demo-theme", next); } catch {}
    }));
  },
  // Reveal elements with class "rv" as they scroll into view.
  initReveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
    // A fast scroll can skip past an element between checks: reveal anything already scrolled past.
    const sweep = () => document.querySelectorAll(".rv:not(.in)").forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * .9) { el.classList.add("in"); io.unobserve(el); }
    });
    addEventListener("scroll", () => requestAnimationFrame(sweep), { passive: true });
  }
};

// #2819: the page's state for the stylesheet: live while its challenge runs, done once it is finished. prerender.mjs copies
// it into the static HTML, so the first paint is right before any script runs. Node scripts load this file with
// document = {}, so it only runs in a page.
if (typeof document !== "undefined" && document.documentElement && document.documentElement.dataset) {
  const cur = CH.current(), root = document.documentElement;
  if (cur && cur.status === "active") root.dataset.challenge = "live";
  else if (cur && cur.status === "completed") root.dataset.challenge = "done";
  else delete root.dataset.challenge;
}

// Packs the groups into three columns as level as they can be, so the boxes sit with no holes (owner, tasks #156 and #154).
// Tries every split and keeps the one with the smallest difference between the tallest and shortest column; on a tie,
// the first split found, which keeps earlier groups in earlier columns. A group's height is its heading (about 0.8 of a
// goal tile, head) plus one per goal; i keeps the list order for the stacked phone layout. The calendar uses it too.
CH.dayCols = (groups, n = 3, head = 0.8) => {
  const h = groups.map(gr => head + gr.goals.length);
  let best = null;
  const walk = (i, at, used) => {
    if (i === groups.length) {
      const sums = Array.from({ length: n }, (_, k) => at.reduce((s, c, j) => s + (c === k ? h[j] : 0), 0));
      const spread = Math.max(...sums) - Math.min(...sums);
      if (used === n && (!best || spread < best.spread - 1e-9)) best = { spread, at: [...at] };
      return;
    }
    for (let k = 0; k <= Math.min(used, n - 1); k++) { at.push(k); walk(i + 1, at, Math.max(used, k + 1)); at.pop(); }
  };
  walk(0, [], 0);
  const at = best ? best.at : groups.map((_, i) => i % n);
  return Array.from({ length: n }, (_, k) => groups.map((gr, i) => ({ gr, i })).filter(({ i }) => at[i] === k)).filter(l => l.length);
};
