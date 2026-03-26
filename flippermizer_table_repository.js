(function(global){
  'use strict';

  function normLookup(v){
    var s = String(v || '').toLowerCase();
    s = s.replace(/&/g, ' and ');
    s = s.replace(/["']/g, '');
    s = s.replace(/\b(the|pinball|table)\b/g, ' ');
    s = s.replace(/\b(stern|bally|williams|gottlieb|data\s*east|sega)\b/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    if(/^star\s*trek\s*(the\s*)?(next\s*gen|nextgen|tng|next\s*generation)$/.test(s)){
      s = 'star trek the next generation';
    }
    return s.replace(/[^a-z0-9]+/g, '').trim();
  }

  var WORLD_ORDER = ['w1','w2','w3','w4','w5','boss'];

  var WORLD_SPECS = {
    w1: {
      key: 'w1',
      label: 'World 1; Ramps Rumpus',
      lockedDefault: false,
      emoji: '\u{1F6E3}\uFE0F',
      overviewEmoji: '\u{1F6E3}\uFE0F'
    },
    w2: {
      key: 'w2',
      label: 'World 2; Malt Desniy World',
      lockedDefault: true,
      emoji: '\u{1F30D}',
      overviewEmoji: '\u{1F30D}'
    },
    w3: {
      key: 'w3',
      label: 'World 3; Vintage Television',
      lockedDefault: true,
      emoji: '\u{1F4FA}',
      overviewEmoji: '\u{1F4FA}'
    },
    w4: {
      key: 'w4',
      label: 'World 4; Spinner Sparring',
      lockedDefault: true,
      emoji: '\u{1F300}',
      overviewEmoji: '\u{1F300}'
    },
    w5: {
      key: 'w5',
      label: 'World 5; Featured Designer; Python Anghelo',
      lockedDefault: true,
      emoji: '\u{1F40D}',
      overviewEmoji: '\u{1F40D}'
    },
    boss: {
      key: 'boss',
      label: 'World 6; Boss',
      lockedDefault: true,
      emoji: '\u{1F451}',
      overviewEmoji: ''
    }
  };

  var TABLES = [
    { code:'MM', slug:'medieval_madness', name:'Medieval Madness', aliases:['Medieval'] },
    { code:'AFM', slug:'attack_from_mars', name:'Attack from Mars', aliases:['AFM'] },
    { code:'WCS', slug:'world_cup_soccer', name:'World Cup Soccer', aliases:['Dog Soccer','WCS94'] },
    { code:'GET', slug:'the_getaway', name:'The Getaway', aliases:['Getaway'] },
    { code:'ST13', slug:'star_trek_stern_2013', name:'Star Trek (Stern 2013)', aliases:['Star Trek Stern 2013','Star Trek Stern','Star Trek (Stern)'] },

    { code:'TOTAN', slug:'tales_of_the_arabian_nights', name:'Tales of the Arabian Nights', aliases:['TOTAN'] },
    { code:'FATH', slug:'fathom', name:'Fathom', aliases:[] },
    { code:'HOOK', slug:'hook', name:'Hook', aliases:[] },
    { code:'CONGO', slug:'congo', name:'Congo', aliases:[] },
    { code:'MCAST', slug:'mystery_castle', name:'Mystery Castle', aliases:['Black Castle'] },

    { code:'ATEAM', slug:'the_a_team', name:'The A-Team', aliases:['A Team'] },
    { code:'BAT66', slug:'batman_66', name:'Batman 66', aliases:['Batman (66 Premium)','Batman (66 Limited Edition)','Batman 66 Stern Tribute'] },
    { code:'HHEAT', slug:'hollywood_heat', name:'Hollywood Heat', aliases:[] },
    { code:'BAYW', slug:'baywatch', name:'Baywatch', aliases:[] },
    { code:'STTNG', slug:'star_trek_the_next_generation', name:'Star Trek The Next Generation', aliases:['Star Trek TNG','Star Trek Next Gen','STTNG'] },

    { code:'MET', slug:'meteor', name:'Meteor', aliases:[] },
    { code:'HGT', slug:'harlem_globetrotters', name:'Harlem Globetrotters', aliases:['Harlem Globetrotters On Tour'] },
    { code:'DP', slug:'dolly_parton', name:'Dolly Parton', aliases:[] },
    { code:'PARA', slug:'paragon', name:'Paragon', aliases:[] },
    { code:'ROBO', slug:'robocop', name:'Robocop', aliases:['RoboCop'] },

    { code:'GLIZ', slug:'grand_lizard', name:'Grand Lizard', aliases:[] },
    { code:'JOK', slug:'jokerz', name:'Jokerz!', aliases:['Jokerz'] },
    { code:'BCAT', slug:'bad_cats', name:'Bad Cats', aliases:[] },
    { code:'TAXI', slug:'taxi', name:'Taxi', aliases:[] },
    { code:'BOP', slug:'bride_of_pinbot', name:'Bride of Pinbot', aliases:['Bride Of Pinbot','Bride of Pin*Bot'] },

    { code:'WW', slug:'white_water', name:'White Water', aliases:['Whitewater'] },
    { code:'HSPD', slug:'high_speed', name:'High Speed', aliases:[] },
    { code:'NFEAR', slug:'no_fear_dangerous_sports', name:'No Fear: Dangerous Sports', aliases:['No Fear','No Fear Dangerous Sports'] },
    { code:'SMVE', slug:'spider_man_vault_edition', name:'Spider-Man Vault Edition', aliases:['Spider-Man VE','Spider-Man (Vault Edition)'] },
    { code:'IMVE', slug:'iron_man_vault_edition', name:'Iron Man Vault Edition', aliases:['Iron Man VE','Iron Man (Vault Edition)','Iron Man Pro Vault Edition','Iron Man / Iron Man Vault Edition'] },
    { code:'ACDC', slug:'acdc', name:'AC/DC', aliases:['ACDC','AC/DC Pro Vault Edition'] },
    { code:'PARTY', slug:'party_animal', name:'Party Animal', aliases:['Party Animal!'] },
    { code:'EATPM', slug:'elvira_and_the_party_monsters', name:'Elvira and the Party Monsters', aliases:['Elvira & the Party Monsters','Elvira and Party Monsters'] },
    { code:'DRDUDE', slug:'dr_dude', name:'Dr. Dude', aliases:['Dr. Dude And His Excellent Ray','Dr. Dude and his Excellent Ray','Dr Dude','Dr Dude and his Excellent Ray'] },
    { code:'PZONE', slug:'party_zone', name:'Party Zone', aliases:['The Party Zone'] },
    { code:'SSTIFF', slug:'scared_stiff', name:'Scared Stiff', aliases:[] },
    { code:'IJTPA', slug:'indiana_jones_the_pinball_adventure', name:'Indiana Jones: The Pinball Adventure', aliases:['Indiana Jones TPA','Williams Indiana Jones','Indiana Jones'] },
    { code:'BSD', slug:'bram_stokers_dracula', name:'Bram Stoker\'s Dracula', aliases:['Bram Stoker’s Dracula','Dracula'] },
    { code:'PFOR', slug:'police_force', name:'Police Force', aliases:[] },
    { code:'HUR', slug:'hurricane', name:'Hurricane', aliases:[] },
    { code:'COMET', slug:'comet', name:'Comet', aliases:[] },
    { code:'CYC', slug:'cyclone', name:'Cyclone', aliases:[] },
    { code:'FH', slug:'funhouse', name:'FunHouse', aliases:['Funhouse'] },
    { code:'WHRL', slug:'whirlwind', name:'Whirlwind', aliases:[] },
    { code:'TAF', slug:'the_addams_family', name:'The Addams Family', aliases:['Addams Family'] },
    { code:'FT', slug:'fish_tales', name:'Fish Tales', aliases:[] },
    { code:'BK2K', slug:'black_knight_2000', name:'Black Knight 2000', aliases:['BK2000'] },
    { code:'BROSE', slug:'black_rose', name:'Black Rose', aliases:[] },
    { code:'CFTBL', slug:'creature_from_the_black_lagoon', name:'Creature from the Black Lagoon', aliases:['Creature'] },
    { code:'TOM', slug:'theatre_of_magic', name:'Theatre of Magic', aliases:['Theater of Magic'] },

    { code:'BOSS_TABLE', slug:'boss_table_placeholder', name:'(Boss Table)', aliases:['Boss Table','Boss'] }
  ];

  var TABLE_DISPLAY_META_BY_CODE = {
    MM:{ displayName:'Medieval Madness (Williams 1997)', manufacturer:'Williams', year:1997 },
    AFM:{ displayName:'Attack from Mars (Bally 1995)', manufacturer:'Bally', year:1995 },
    WCS:{ displayName:'World Cup Soccer (Bally 1994)', manufacturer:'Bally', year:1994 },
    GET:{ displayName:'The Getaway: High Speed II (Williams 1992)', manufacturer:'Williams', year:1992 },
    ST13:{ displayName:'Star Trek (Stern 2013)', manufacturer:'Stern', year:2013 },
    TOTAN:{ displayName:'Tales of the Arabian Nights (Williams 1996)', manufacturer:'Williams', year:1996 },
    FATH:{ displayName:'Fathom (Bally 1981)', manufacturer:'Bally', year:1981 },
    HOOK:{ displayName:'Hook (Data East 1992)', manufacturer:'Data East', year:1992 },
    CONGO:{ displayName:'Congo (Williams 1995)', manufacturer:'Williams', year:1995 },
    MCAST:{ displayName:'Mystery Castle (Alvin G 1993)', manufacturer:'Alvin G', year:1993 },
    ATEAM:{ displayName:'The A-Team (Original VPX 2023)', manufacturer:'Original VPX', year:2023 },
    BAT66:{ displayName:'Batman 66 (Stern 2016)', manufacturer:'Stern', year:2016 },
    HHEAT:{ displayName:'Hollywood Heat (Gottlieb 1986)', manufacturer:'Gottlieb', year:1986 },
    BAYW:{ displayName:'Baywatch (Sega 1995)', manufacturer:'Sega', year:1995 },
    STTNG:{ displayName:'Star Trek: The Next Generation (Williams 1993)', manufacturer:'Williams', year:1993 },
    MET:{ displayName:'Meteor (Stern 1979)', manufacturer:'Stern', year:1979 },
    HGT:{ displayName:'Harlem Globetrotters (Bally 1979)', manufacturer:'Bally', year:1979 },
    DP:{ displayName:'Dolly Parton (Bally 1979)', manufacturer:'Bally', year:1979 },
    PARA:{ displayName:'Paragon (Bally 1979)', manufacturer:'Bally', year:1979 },
    ROBO:{ displayName:'RoboCop (Data East 1989)', manufacturer:'Data East', year:1989 },
    GLIZ:{ displayName:'Grand Lizard (Williams 1986)', manufacturer:'Williams', year:1986 },
    JOK:{ displayName:'Jokerz! (Williams 1988)', manufacturer:'Williams', year:1988 },
    BCAT:{ displayName:'Bad Cats (Williams 1989)', manufacturer:'Williams', year:1989 },
    TAXI:{ displayName:'Taxi (Williams 1988)', manufacturer:'Williams', year:1988 },
    BOP:{ displayName:'The Machine: Bride of Pinbot (Williams 1991)', manufacturer:'Williams', year:1991 },
    WW:{ displayName:'White Water (Williams 1993)', manufacturer:'Williams', year:1993 },
    HSPD:{ displayName:'High Speed (Williams 1986)', manufacturer:'Williams', year:1986 },
    NFEAR:{ displayName:'No Fear: Dangerous Sports (Williams 1995)', manufacturer:'Williams', year:1995 },
    SMVE:{ displayName:'Spider-Man Vault Edition (Stern 2016)', manufacturer:'Stern', year:2016 },
    IMVE:{ displayName:'Iron Man Vault Edition (Stern 2014)', manufacturer:'Stern', year:2014 },
    ACDC:{ displayName:'AC/DC (Stern 2012)', manufacturer:'Stern', year:2012 },
    PARTY:{ displayName:'Party Animal (Bally 1987)', manufacturer:'Bally', year:1987 },
    EATPM:{ displayName:'Elvira and the Party Monsters (Bally 1989)', manufacturer:'Bally', year:1989 },
    DRDUDE:{ displayName:'Dr. Dude and his Excellent Ray (Bally 1990)', manufacturer:'Bally', year:1990 },
    PZONE:{ displayName:'Party Zone (Bally 1991)', manufacturer:'Bally', year:1991 },
    SSTIFF:{ displayName:'Scared Stiff (Bally 1996)', manufacturer:'Bally', year:1996 },
    IJTPA:{ displayName:'Indiana Jones: The Pinball Adventure (Williams 1993)', manufacturer:'Williams', year:1993 },
    BSD:{ displayName:'Bram Stoker\'s Dracula (Williams 1993)', manufacturer:'Williams', year:1993 },
    PFOR:{ displayName:'Police Force (Williams 1989)', manufacturer:'Williams', year:1989 },
    HUR:{ displayName:'Hurricane (Williams 1991)', manufacturer:'Williams', year:1991 },
    COMET:{ displayName:'Comet (Williams 1985)', manufacturer:'Williams', year:1985 },
    CYC:{ displayName:'Cyclone (Williams 1988)', manufacturer:'Williams', year:1988 },
    FH:{ displayName:'FunHouse (Williams 1990)', manufacturer:'Williams', year:1990 },
    WHRL:{ displayName:'Whirlwind (Williams 1990)', manufacturer:'Williams', year:1990 },
    TAF:{ displayName:'The Addams Family (Bally 1992)', manufacturer:'Bally', year:1992 },
    FT:{ displayName:'Fish Tales (Williams 1992)', manufacturer:'Williams', year:1992 },
    BK2K:{ displayName:'Black Knight 2000 (Williams 1989)', manufacturer:'Williams', year:1989 },
    BROSE:{ displayName:'Black Rose (Bally 1992)', manufacturer:'Bally', year:1992 },
    CFTBL:{ displayName:'Creature from the Black Lagoon (Bally 1992)', manufacturer:'Bally', year:1992 },
    TOM:{ displayName:'Theatre of Magic (Bally 1995)', manufacturer:'Bally', year:1995 },
    BOSS_TABLE:{ displayName:'(Boss Table)', manufacturer:'', year:null }
  };

  var TABLE_BANNER_REFS = {
    MM: 'WorldsBanners/MedievalMadnessCover.png',
    AFM: 'WorldsBanners/BestiaryFlyers/AFM.png',
    WCS: 'WorldsBanners/BestiaryFlyers/WCS.jpg',
    GET: 'WorldsBanners/BestiaryFlyers/GET.jpg',
    ST13: 'WorldsBanners/BestiaryFlyers/ST13.jpg',
    TOTAN: 'WorldsBanners/BestiaryFlyers/TOTAN.png',
    FATH: 'WorldsBanners/BestiaryFlyers/FATH.jpg',
    HOOK: 'WorldsBanners/BestiaryFlyers/HOOK.jpg',
    CONGO: 'WorldsBanners/BestiaryFlyers/CONGO.jpg',
    MCAST: 'WorldsBanners/BestiaryFlyers/MCAST.jpg',
    ATEAM: 'WorldsBanners/BestiaryFlyers/ATEAM.png',
    BAT66: 'WorldsBanners/BestiaryFlyers/BAT66.png',
    HHEAT: 'WorldsBanners/BestiaryFlyers/HHEAT.jpg',
    BAYW: 'WorldsBanners/BestiaryFlyers/BAYW.jpg',
    STTNG: 'WorldsBanners/BestiaryFlyers/STTNG.jpg',
    MET: 'WorldsBanners/BestiaryFlyers/MET.jpg',
    HGT: 'WorldsBanners/BestiaryFlyers/HGT.jpg',
    DP: 'WorldsBanners/BestiaryFlyers/DP.jpg',
    PARA: 'WorldsBanners/BestiaryFlyers/PARA.jpg',
    ROBO: 'WorldsBanners/BestiaryFlyers/ROBO.jpg',
    GLIZ: 'WorldsBanners/BestiaryFlyers/GLIZ.jpg',
    JOK: 'WorldsBanners/BestiaryFlyers/JOK.jpg',
    BCAT: 'WorldsBanners/BestiaryFlyers/BCAT.jpg',
    TAXI: 'WorldsBanners/BestiaryFlyers/TAXI.jpg',
    BOP: 'WorldsBanners/BestiaryFlyers/BOP.jpeg',
    WW: 'WorldsBanners/BestiaryFlyers/WW.jpg',
    HSPD: 'WorldsBanners/BestiaryFlyers/HSPD.jpg',
    BK2K: 'WorldsBanners/BestiaryFlyers/BK2K.png',
    IMVE: 'WorldsBanners/BestiaryFlyers/IMVE.png',
    ACDC: 'WorldsBanners/BestiaryFlyers/ACDC.jpg',
    PARTY: 'WorldsBanners/BestiaryFlyers/PARTY.jpg',
    EATPM: 'WorldsBanners/BestiaryFlyers/EATPM.jpg',
    DRDUDE: 'WorldsBanners/BestiaryFlyers/DRDUDE.jpg',
    PZONE: 'WorldsBanners/BestiaryFlyers/PZONE.jpg',
    SSTIFF: 'WorldsBanners/BestiaryFlyers/SSTIFF.jpg',
    IJTPA: 'WorldsBanners/BestiaryFlyers/IJTPA.jpg',
    TAF: 'WorldsBanners/BestiaryFlyers/TAF.jpg',
    FH: 'WorldsBanners/BestiaryFlyers/FH.jpg',
    FT: 'WorldsBanners/BestiaryFlyers/FT.jpg',
    BROSE: 'WorldsBanners/BestiaryFlyers/BROSE.jpg',
    BSD: 'WorldsBanners/BestiaryFlyers/BSD.jpg',
    PFOR: 'WorldsBanners/BestiaryFlyers/PFOR.jpg',
    CFTBL: 'WorldsBanners/BestiaryFlyers/CFTBL.png',
    TOM: 'WorldsBanners/BestiaryFlyers/TOM.jpg',
    HUR: 'WorldsBanners/BestiaryFlyers/HUR.jpg',
    COMET: 'WorldsBanners/BestiaryFlyers/COMET.jpg',
    CYC: 'WorldsBanners/BestiaryFlyers/CYC.jpg',
    WHRL: 'WorldsBanners/BestiaryFlyers/WHRL.jpg',
    SMVE: 'WorldsBanners/BestiaryFlyers/SMVE.jpg',
    NFEAR: 'WorldsBanners/BestiaryFlyers/NFEAR.jpg'
  };

  var DEFAULT_WORLD_TABLE_CODES = {
    w1: ['MM','AFM','WCS','GET','ST13'],
    w2: ['TOTAN','FATH','HOOK','CONGO','MCAST'],
    w3: ['ATEAM','BAT66','HHEAT','BAYW','STTNG'],
    w4: ['MET','HGT','DP','PARA','ROBO'],
    w5: ['GLIZ','JOK','BCAT','TAXI','BOP'],
    boss: ['BOSS_TABLE']
  };

  var DESIGNERS = [
    {
      key: 'pythonanghelo',
      name: 'Python Anghelo',
      aliases: ['Python', 'Constantin Anghelo'],
      headline: 'Designer, artist, and concept contributor from the Williams era.',
      headshot: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/93/Python_Anghelo.jpg/250px-Python_Anghelo.jpg',
      sources: [
        'https://en.wikipedia.org/wiki/Python_Anghelo',
        'https://www.ipdb.org/machine.cgi?id=1070',
        'https://www.ipdb.org/machine.cgi?id=1308',
        'https://www.ipdb.org/machine.cgi?id=127',
        'https://www.ipdb.org/machine.cgi?id=2505',
        'https://www.ipdb.org/machine.cgi?id=1502'
      ]
    },
    {
      key: 'steveritchie',
      name: 'Steve Ritchie',
      aliases: ['Steve', 'King Steve', 'Steve Ritchie'],
      headline: 'Designer, voice actor, and flow-first pinball architect across Atari, Williams, Stern, and Jersey Jack eras.',
      headshot: 'https://cdn.prod.website-files.com/630f7e3a17d08a21ae05d20a/6488d9903fad2a1a24140473_oVi6PajYe-f3Ubw1gZ6luGz6RaBfP4Qo_fzXr0Iwenw.avif',
      sources: [
        'https://en.wikipedia.org/wiki/Steve_Ritchie_(pinball_designer)',
        'https://www.kineticist.com/pinball-people/steve-ritchie',
        'https://www.ipdb.org/machine.cgi?id=1176',
        'https://www.ipdb.org/machine.cgi?id=2852',
        'https://www.ipdb.org/machine.cgi?id=6328',
        'https://www.ipdb.org/machine.cgi?id=5854'
      ]
    },
    {
      key: 'dennisnordman',
      name: 'Dennis Nordman',
      aliases: ['Dennis', 'Dennis Nordman'],
      headline: 'Designer, concept creator, and humor-forward playfield architect behind some of Bally and Williams\' most toy-driven fan favorites.',
      headshot: 'https://cdn.prod.website-files.com/630f7e3a17d08a21ae05d20a/6488a16e9c66d4d332855397_YJ96O1wGQIRziUlZ8CRsUwivcOKWV0VNE40NXpXeNx4.avif',
      sources: [
        'https://www.kineticist.com/pinball-people/dennis-nordman',
        'https://www.ipdb.org/machine.cgi?id=1788',
        'https://www.ipdb.org/machine.cgi?id=790',
        'https://www.ipdb.org/machine.cgi?id=744',
        'https://www.ipdb.org/machine.cgi?id=1789',
        'https://www.ipdb.org/machine.cgi?id=3915'
      ]
    }
  ];

  var TABLE_DESIGNER_CREDITS = {
    GLIZ: [{ designerKey:'pythonanghelo', role:'Design and artwork' }],
    JOK: [{ designerKey:'pythonanghelo', role:'Co-design' }],
    BCAT: [{ designerKey:'pythonanghelo', role:'Artwork' }],
    TAXI: [{ designerKey:'pythonanghelo', role:'Design and artwork' }],
    BOP: [{ designerKey:'pythonanghelo', role:'Concept and artwork' }],
    HSPD: [{ designerKey:'steveritchie', role:'Design' }],
    NFEAR: [{ designerKey:'steveritchie', role:'Design' }],
    SMVE: [{ designerKey:'steveritchie', role:'Design' }],
    ACDC: [{ designerKey:'steveritchie', role:'Design' }],
    PARTY: [{ designerKey:'dennisnordman', role:'Design' }],
    EATPM: [{ designerKey:'dennisnordman', role:'Design' }],
    DRDUDE: [{ designerKey:'dennisnordman', role:'Design' }],
    PZONE: [{ designerKey:'dennisnordman', role:'Design' }],
    SSTIFF: [{ designerKey:'dennisnordman', role:'Design' }]
  };

  var TABLE_BY_CODE = Object.create(null);
  var LOOKUP_CODE_BY_KEY = Object.create(null);
  var DESIGNER_BY_KEY = Object.create(null);
  var DESIGNER_KEY_BY_LOOKUP = Object.create(null);

  TABLES.forEach(function(t){
    var extraMeta = TABLE_DISPLAY_META_BY_CODE[String(t.code || '').trim()] || {};
    var table = {
      code: String(t.code || '').trim(),
      slug: String(t.slug || '').trim(),
      name: String(t.name || '').trim(),
      displayName: String(extraMeta.displayName || t.name || '').trim(),
      manufacturer: String(extraMeta.manufacturer || '').trim(),
      year: Number.isFinite(Number(extraMeta.year)) ? Number(extraMeta.year) : null,
      aliases: Array.isArray(t.aliases) ? t.aliases.slice() : [],
      banner: String(TABLE_BANNER_REFS[String(t.code || '').trim()] || '').trim()
    };
    if(!table.code || !table.name) return;
    TABLE_BY_CODE[table.code] = table;

    var keys = [table.code, table.name, table.slug].concat(table.aliases || []);
    keys.forEach(function(k){
      var n = normLookup(k);
      if(n) LOOKUP_CODE_BY_KEY[n] = table.code;
    });
  });

  DESIGNERS.forEach(function(d){
    var key = String(d.key || '').trim();
    var name = String(d.name || '').trim();
    if(!key || !name) return;
    var safe = {
      key: key,
      name: name,
      aliases: Array.isArray(d.aliases) ? d.aliases.slice() : [],
      headline: String(d.headline || '').trim(),
      headshot: String(d.headshot || '').trim(),
      sources: Array.isArray(d.sources) ? d.sources.slice() : []
    };
    DESIGNER_BY_KEY[key] = safe;
    var keys = [safe.key, safe.name].concat(safe.aliases || []);
    keys.forEach(function(k){
      var n = normLookup(k);
      if(n) DESIGNER_KEY_BY_LOOKUP[n] = safe.key;
    });
  });

  function resolveTable(query){
    if(query == null) return null;
    var q = String(query).trim();
    if(!q) return null;

    if(TABLE_BY_CODE[q]) return TABLE_BY_CODE[q];

    var n = normLookup(q);
    if(!n) return null;

    var code = LOOKUP_CODE_BY_KEY[n];
    if(code && TABLE_BY_CODE[code]) return TABLE_BY_CODE[code];
    return null;
  }

  function getTableByCode(code){
    var c = String(code || '').trim();
    return c && TABLE_BY_CODE[c] ? TABLE_BY_CODE[c] : null;
  }

  function getCanonicalTableName(query){
    var t = resolveTable(query);
    return t ? t.name : String(query || '').trim();
  }

  function getCanonicalTableCode(query){
    var t = resolveTable(query);
    return t ? t.code : null;
  }

  function getDisplayTableName(query){
    var t = resolveTable(query);
    return t ? String(t.displayName || t.name || '').trim() : String(query || '').trim();
  }

  function getTableMeta(query){
    var t = resolveTable(query);
    if(!t) return null;
    return {
      code: t.code,
      slug: t.slug,
      name: t.name,
      displayName: t.displayName || t.name,
      manufacturer: t.manufacturer || '',
      year: t.year,
      aliases: (t.aliases || []).slice(),
      banner: t.banner || ''
    };
  }

  function toWorldSpec(worldKey, worldInput, options){
    options = options || {};
    var base = WORLD_SPECS[worldKey] || { key:worldKey, label:String(worldKey||''), lockedDefault:true };

    var label = base.label;
    var locked = !!base.lockedDefault;
    var banner = '';
    var tableInputs = (DEFAULT_WORLD_TABLE_CODES[worldKey] || []).slice();

    if(Array.isArray(worldInput)){
      tableInputs = worldInput.slice();
    }else if(worldInput && typeof worldInput === 'object'){
      if(Array.isArray(worldInput.tables)) tableInputs = worldInput.tables.slice();
      if(typeof worldInput.label === 'string') label = worldInput.label;
      if(typeof worldInput.locked === 'boolean') locked = worldInput.locked;
      if(typeof worldInput.banner === 'string') banner = worldInput.banner;
    }

    var unresolved = [];
    var tables = [];

    tableInputs.forEach(function(entry){
      var t = resolveTable(entry);
      if(t){
        tables.push(t.name);
      }else{
        var fallback = String(entry || '').trim();
        if(fallback){
          tables.push(fallback);
          unresolved.push(fallback);
        }
      }
    });

    if(worldKey === 'boss' && !options.allowCustomBossWorldTables){
      tables = ['(Boss Table)'];
      unresolved = [];
    }

    return {
      key: worldKey,
      label: label,
      locked: locked,
      banner: banner,
      tables: tables,
      unresolved: unresolved
    };
  }

  function composeWorlds(layoutByWorld, options){
    options = options || {};
    var worlds = {};
    var unresolved = [];

    WORLD_ORDER.forEach(function(worldKey){
      var input = null;
      if(layoutByWorld && Object.prototype.hasOwnProperty.call(layoutByWorld, worldKey)){
        input = layoutByWorld[worldKey];
      }
      var spec = toWorldSpec(worldKey, input, options);
      worlds[worldKey] = {
        label: spec.label,
        locked: !!spec.locked,
        banner: spec.banner || '',
        tables: spec.tables.slice()
      };
      if(spec.unresolved.length){
        unresolved.push({ world: worldKey, values: spec.unresolved.slice() });
      }
    });

    return {
      worlds: worlds,
      unresolved: unresolved,
      worldOrder: WORLD_ORDER.slice()
    };
  }

  function buildDefaultWorldsState(){
    return composeWorlds(null, { allowCustomBossWorldTables:false }).worlds;
  }

  function getWorldOrder(){
    return WORLD_ORDER.slice();
  }

  function getWorldEmojiMap(){
    var out = {};
    WORLD_ORDER.forEach(function(k){ out[k] = (WORLD_SPECS[k] && WORLD_SPECS[k].emoji) ? WORLD_SPECS[k].emoji : ''; });
    return out;
  }

  function getOverviewEmojiMap(){
    var out = {};
    WORLD_ORDER.forEach(function(k){
      var v = (WORLD_SPECS[k] && WORLD_SPECS[k].overviewEmoji) ? WORLD_SPECS[k].overviewEmoji : '';
      if(v) out[k] = v;
    });
    return out;
  }

  function getAllTables(){
    return TABLES.map(function(t){
      var code = String(t.code || '').trim();
      var resolved = getTableByCode(code);
      return {
        code: code,
        slug: t.slug,
        name: t.name,
        displayName: resolved ? (resolved.displayName || resolved.name) : t.name,
        manufacturer: resolved ? (resolved.manufacturer || '') : '',
        year: resolved ? resolved.year : null,
        aliases: (t.aliases||[]).slice(),
        banner: String(TABLE_BANNER_REFS[code] || '').trim()
      };
    });
  }

  function resolveDesigner(query){
    if(query == null) return null;
    var q = String(query).trim();
    if(!q) return null;
    if(DESIGNER_BY_KEY[q]) return DESIGNER_BY_KEY[q];
    var n = normLookup(q);
    if(!n) return null;
    var key = DESIGNER_KEY_BY_LOOKUP[n];
    return (key && DESIGNER_BY_KEY[key]) ? DESIGNER_BY_KEY[key] : null;
  }

  function getAllDesigners(){
    return Object.keys(DESIGNER_BY_KEY).map(function(key){
      var d = DESIGNER_BY_KEY[key];
      return {
        key: d.key,
        name: d.name,
        aliases: (d.aliases || []).slice(),
        headline: d.headline || '',
        headshot: d.headshot || '',
        sources: (d.sources || []).slice()
      };
    });
  }

  function getDesignerCreditsForTableCode(code){
    var c = String(code || '').trim();
    var arr = Array.isArray(TABLE_DESIGNER_CREDITS[c]) ? TABLE_DESIGNER_CREDITS[c] : [];
    return arr.map(function(x){
      var d = DESIGNER_BY_KEY[String(x.designerKey || '').trim()];
      return {
        designerKey: String(x.designerKey || '').trim(),
        designerName: d ? d.name : '',
        role: String(x.role || '').trim()
      };
    });
  }

  function getTablesForDesigner(query){
    var d = resolveDesigner(query);
    if(!d) return [];
    var out = [];
    Object.keys(TABLE_DESIGNER_CREDITS).forEach(function(code){
      var arr = Array.isArray(TABLE_DESIGNER_CREDITS[code]) ? TABLE_DESIGNER_CREDITS[code] : [];
      var match = arr.find(function(x){ return String(x.designerKey || '').trim() === d.key; });
      if(!match) return;
      var t = getTableByCode(code);
      out.push({
        code: code,
        name: t ? t.name : code,
        displayName: t ? (t.displayName || t.name) : code,
        role: String(match.role || '').trim()
      });
    });
    return out;
  }

  var repo = {
    version: '1.3.0',
    worldOrder: getWorldOrder(),
    worldSpecs: JSON.parse(JSON.stringify(WORLD_SPECS)),
    defaultWorldTableCodes: JSON.parse(JSON.stringify(DEFAULT_WORLD_TABLE_CODES)),
    tables: getAllTables(),
    normalizeLookup: normLookup,
    resolveTable: resolveTable,
    getTableByCode: getTableByCode,
    getCanonicalTableName: getCanonicalTableName,
    getCanonicalTableCode: getCanonicalTableCode,
    getDisplayTableName: getDisplayTableName,
    getTableMeta: getTableMeta,
    getAllTables: getAllTables,
    resolveDesigner: resolveDesigner,
    getAllDesigners: getAllDesigners,
    getDesignerCreditsForTableCode: getDesignerCreditsForTableCode,
    getTablesForDesigner: getTablesForDesigner,
    getWorldOrder: getWorldOrder,
    getWorldEmojiMap: getWorldEmojiMap,
    getOverviewEmojiMap: getOverviewEmojiMap,
    composeWorlds: composeWorlds,
    buildDefaultWorldsState: buildDefaultWorldsState
  };

  global.FLPR_TABLE_REPO = repo;
})(typeof window !== 'undefined' ? window : this);
