import { MigrationInterface, QueryRunner } from 'typeorm';

const genres = [
  {
    id: '0BqScrUZP2i9',
    name: 'Abstract Hip Hop',
  },
  {
    id: 'IJqCi2SjGHVS',
    name: 'Alternative Metal',
  },
  {
    id: 'SkpU7cgAJaSj',
    name: 'Alternative R&B',
  },
  {
    id: '_kNaFpg9BnHn',
    name: 'Alternative Rock',
  },
  {
    id: 'j-9gam2xqAGX',
    name: 'Ambient',
  },
  {
    id: 'YiaRIzuCmuuY',
    name: 'Ambient House',
  },
  {
    id: 'azTOl9ZZeYnn',
    name: 'Ambient Pop',
  },
  {
    id: '8cKE7U2uQGUT',
    name: 'Ambient Techno',
  },
  {
    id: '5B0uMsUcELg_',
    name: 'American Primitivism',
  },
  {
    id: 'hPWGs84cHOyz',
    name: 'Americana',
  },
  {
    id: 'rzoCzPkB-S6_',
    name: 'AOR',
  },
  {
    id: 'dpm8QIlmFz0B',
    name: 'Art Pop',
  },
  {
    id: 'PYEY1FKFQeJT',
    name: 'Art Punk',
  },
  {
    id: 'KZl0wF1d1Dkv',
    name: 'Art Rock',
  },
  {
    id: 'rlAPgoqzjcRq',
    name: 'Atmospheric Black Metal',
  },
  {
    id: 'p82P0BR4Dbre',
    name: 'Avant-Folk',
  },
  {
    id: '2tGtgglQi5i9',
    name: 'Avant-Garde Jazz',
  },
  {
    id: '4OX1D3T00hnJ',
    name: 'Avant-Garde Metal',
  },
  {
    id: 'E8nJt6p00sx-',
    name: 'Baroque Pop',
  },
  {
    id: 'lGEY4Lt5VMO0',
    name: 'Bass',
  },
  {
    id: 'mH5mz8BCRHj6',
    name: 'Bedroom Pop',
  },
  {
    id: 'JQQTdFrw7G6g',
    name: 'Big Beat',
  },
  {
    id: '9bMovMFuDFZL',
    name: 'Black Metal',
  },
  {
    id: '26Xg8x34UanZ',
    name: 'Blackgaze',
  },
  {
    id: 'r1A5k3N-dgAJ',
    name: 'Blue-eyed Soul',
  },
  {
    id: 'nBT8CGNm_Nin',
    name: 'Bluegrass',
  },
  {
    id: 'ag9hsmj5JaZj',
    name: 'Blues',
  },
  {
    id: '0uxspEmr89zs',
    name: 'Blues Rock',
  },
  {
    id: 'Qcybxz4Oi2B_',
    name: 'Boom Bap',
  },
  {
    id: 'mOoSSz5zea2g',
    name: 'Bossa Nova',
  },
  {
    id: 'eavOgU9AjUck',
    name: 'Breakbeat',
  },
  {
    id: 'GzlD48s0ie2y',
    name: 'Britpop',
  },
  {
    id: 'KPy5N-7N5uOv',
    name: 'Brutal Death Metal',
  },
  {
    id: 'QQIluJ7DlfeU',
    name: 'Bubblegum Bass',
  },
  {
    id: 'UUV1gAykM926',
    name: 'Canterbury Scene',
  },
  {
    id: 'Yw2Y-TLpFl63',
    name: 'Celtic Folk',
  },
  {
    id: '6bps8J4o-Kei',
    name: 'Celtic Punk',
  },
  {
    id: 'Kygi2G3PTGL3',
    name: 'Chamber Folk',
  },
  {
    id: 'zHWPB5hg5hE-',
    name: 'Chamber Pop',
  },
  {
    id: 'Dyr1LdHtI6Dj',
    name: "Children's Music",
  },
  {
    id: 'joj_bmpkyoxI',
    name: 'Chillwave',
  },
  {
    id: 'jjrWPo_NSQkv',
    name: 'Chiptune',
  },
  {
    id: 'aHu9u6_N9iWa',
    name: 'Christmas',
  },
  {
    id: 'bxATnzRoT1ey',
    name: 'City Pop',
  },
  {
    id: 'DOMp0ZskhOBA',
    name: 'Classic Rock',
  },
  {
    id: 'wTgsh3YgY_V-',
    name: 'Classical',
  },
  {
    id: 'ayytVKMhej6F',
    name: 'Cloud Rap',
  },
  {
    id: 'SBacakZjrxvf',
    name: 'Comedy',
  },
  {
    id: 'g-fkhB3cap8M',
    name: 'Comedy Rap',
  },
  {
    id: 'uIzS9MKbVdqZ',
    name: 'Comedy Rock',
  },
  {
    id: 'M8K6f4YRoaP_',
    name: 'Conscious Hip Hop',
  },
  {
    id: '_hVNA5xiA8kq',
    name: 'Country',
  },
  {
    id: '2nNUwhWUmhXC',
    name: 'Country Pop',
  },
  {
    id: 'rzH4ISbazthy',
    name: 'Country Rock',
  },
  {
    id: 'rXb-m5TO1_X1',
    name: 'Country Soul',
  },
  {
    id: '4CcVb5GbEsA_',
    name: 'Crossover Thrash',
  },
  {
    id: 'Ok2aEP0CkUg4',
    name: 'Dance',
  },
  {
    id: 'GIoK2CiEOnvP',
    name: 'Dance Pop',
  },
  {
    id: 'dfJgJ4DXUwo0',
    name: 'Dance Punk',
  },
  {
    id: 'rtOK0J6ZmGSm',
    name: 'Dancehall',
  },
  {
    id: 'thBd3W9KN13i',
    name: 'Dark Ambient',
  },
  {
    id: 'kryu4GERRPb6',
    name: 'Dark Folk',
  },
  {
    id: 'Fai3oTNqK1GH',
    name: 'Dark Jazz',
  },
  {
    id: 'gqr7J6eK7eFz',
    name: 'Darkwave',
  },
  {
    id: 'vEZoyFw2GP6k',
    name: 'Death Industrial',
  },
  {
    id: '_8mobe6pSsUs',
    name: 'Death Metal',
  },
  {
    id: '7rWUJb9ymjuZ',
    name: 'Deathcore',
  },
  {
    id: 'Jh-vd3HGsU1-',
    name: 'Deconstructed Club',
  },
  {
    id: 'y5eZ78PeR-Mk',
    name: 'Deep House',
  },
  {
    id: 'xMBCR_HooHtS',
    name: 'Digital Hardcore',
  },
  {
    id: 'gfN8aFp-F6qx',
    name: 'Disco',
  },
  {
    id: 'I8QRw6DHboiO',
    name: 'Djent',
  },
  {
    id: 'lPLqLlBMG2ic',
    name: 'Doom Metal',
  },
  {
    id: '6e9zg6N-jl1f',
    name: 'Downtempo',
  },
  {
    id: '1pfHmHTXD4KG',
    name: 'Dream Pop',
  },
  {
    id: 'YeHvtPZ4U3pW',
    name: 'Drill',
  },
  {
    id: '717_dl1fN704',
    name: 'Drill and Bass',
  },
  {
    id: 'XPS_EXnUqlrV',
    name: 'Drone',
  },
  {
    id: 'evDm3l2SJY-t',
    name: 'Drone Metal',
  },
  {
    id: 'jNxP-kECE33Z',
    name: 'Drum and Bass',
  },
  {
    id: 'kw5Ewp2YszAt',
    name: 'Dub',
  },
  {
    id: 'DjHTMB8vTvxB',
    name: 'Dub Techno',
  },
  {
    id: '9HKdthhJ5P_J',
    name: 'Dubstep',
  },
  {
    id: 'eHCmnoYCQWKf',
    name: 'Dungeon Synth',
  },
  {
    id: 'I6p5IDC9PINX',
    name: 'EDM',
  },
  {
    id: '8zOvOP_53DDU',
    name: 'Electro',
  },
  {
    id: '0Knk8zHdx6OR',
    name: 'Electro House',
  },
  {
    id: 'f6vxagCzloe1',
    name: 'Electro-Disco',
  },
  {
    id: 'UEAnIH1FoXBZ',
    name: 'Electro-Industrial',
  },
  {
    id: 'ophrnwydYAyQ',
    name: 'Electroacoustic',
  },
  {
    id: 'MavcsWnyvlUO',
    name: 'Electroclash',
  },
  {
    id: 'RKjHrnQv3V7V',
    name: 'Electronic',
  },
  {
    id: 'aqXF0Tndwab0',
    name: 'Electronica',
  },
  {
    id: 'wZCjRO-ftoGz',
    name: 'Electropop',
  },
  {
    id: 'NWlExPptiIZB',
    name: 'Emo',
  },
  {
    id: '0lYga9gfDHPo',
    name: 'Emo Rap',
  },
  {
    id: 'CD8KrKQVQJvZ',
    name: 'Afrobeats',
  },
  {
    id: 'JO5JhEAL_oOO',
    name: 'Alternative Dance',
  },
  {
    id: 'fLQhBmMRDYj6',
    name: 'Ethereal Wave',
  },
  {
    id: 'GDPG_pXCY-5W',
    name: 'Experimental',
  },
  {
    id: 'PsqT6bzOhoij',
    name: 'Acid Techno',
  },
  {
    id: 'j5WK4NrnADRZ',
    name: 'Alt-Country',
  },
  {
    id: 'LoPEgnWjVLUC',
    name: 'Experimental Hip Hop',
  },
  {
    id: '808j6hM1V50Z',
    name: 'Experimental Metal',
  },
  {
    id: 'dcWeoknIo8mO',
    name: 'Experimental Rock',
  },
  {
    id: 'ORkmfsXYYEbZ',
    name: 'Ska Punk',
  },
  {
    id: 'dzRUi88w-8PD',
    name: 'Field Recordings',
  },
  {
    id: '7bXVNlwLMGtI',
    name: 'Flamenco nuevo',
  },
  {
    id: 'ZKox1WDyidkd',
    name: 'Folk',
  },
  {
    id: '5tvHuiaJ_VWG',
    name: 'Folk Metal',
  },
  {
    id: 'jt1GwhZL49ZU',
    name: 'Folk Pop',
  },
  {
    id: 'PHTvoHHGCMy9',
    name: 'Folk Punk',
  },
  {
    id: 'NyrqIT2j-OYO',
    name: 'Folk Rock',
  },
  {
    id: 'h_DzKY3tmSku',
    name: 'Folktronica',
  },
  {
    id: '7qLnyKAZp2Qt',
    name: 'Footwork',
  },
  {
    id: 'ubG9nDj1cYOT',
    name: 'Freak Folk',
  },
  {
    id: 'izqgZ7k3UzNX',
    name: 'Acid Jazz',
  },
  {
    id: 'mWbGTtwVFHpf',
    name: 'Future Funk',
  },
  {
    id: '-NnFfibe6IF0',
    name: 'Glitch Pop',
  },
  {
    id: 'W_oLIo5Zt1sB',
    name: 'Harsh Noise',
  },
  {
    id: 'oxPHId0-5EGz',
    name: 'Indie Rock',
  },
  {
    id: '_B1B-P938nlH',
    name: 'J-Pop',
  },
  {
    id: 'n2FFr1e2dDJi',
    name: 'Khyal',
  },
  {
    id: '8UyUeL53E8wp',
    name: 'Melodic Black Metal',
  },
  {
    id: 'gCKqL55nGjKU',
    name: 'Minimal Wave',
  },
  {
    id: 'Gyg3gUcMInUc',
    name: 'New Age',
  },
  {
    id: 'Ln5cNk62D1vo',
    name: 'Outsider House',
  },
  {
    id: 'H_1eZabH4v4S',
    name: 'Post-Metal',
  },
  {
    id: 'QGRyT878LTz7',
    name: 'Power Electronics',
  },
  {
    id: 'YAH00wHs7GjM',
    name: 'Psychedelic Folk',
  },
  {
    id: 'qkAYqX_50KAf',
    name: 'Reggaeton',
  },
  {
    id: 'UsE2YuiA1-LE',
    name: 'Singer-Songwriter',
  },
  {
    id: 'wVlCq1bpOHPY',
    name: 'Soul Jazz',
  },
  {
    id: 'VnQSwUSKLWkC',
    name: 'Surf Pop',
  },
  {
    id: '-9AvKicmPEkK',
    name: 'Synthwave',
  },
  {
    id: 'xBexZLxmAeD7',
    name: 'Trap Metal',
  },
  {
    id: 'SK96Mg3B0Rli',
    name: 'UK Hip Hop',
  },
  {
    id: 'dhG0uxmmLMu-',
    name: 'Adult Contemporary',
  },
  {
    id: 'C38pr_GnLC3O',
    name: 'Garage Punk',
  },
  {
    id: 'nxZ6FuVB-Aqj',
    name: 'Grindcore',
  },
  {
    id: 'Pq9vgeCV54mf',
    name: 'Hip Hop',
  },
  {
    id: 'vP8lZmVj2_o0',
    name: 'Indie Pop',
  },
  {
    id: 'udaTi4DUOM-V',
    name: 'Jangle Pop',
  },
  {
    id: 'mdz1rGFZGHhT',
    name: 'Lo-Fi',
  },
  {
    id: 'uU8stwrf9n01',
    name: 'Metal',
  },
  {
    id: 'OQWi7tlFu8RU',
    name: 'Musical Parody',
  },
  {
    id: '25dZUH2f3T8K',
    name: 'Noise Pop',
  },
  {
    id: 'LwD_MB2N3qbe',
    name: 'Pop Punk',
  },
  {
    id: '5q5XclczNDpJ',
    name: 'Post-Minimalism',
  },
  {
    id: 'I-HV_BBourdn',
    name: 'Progressive Pop',
  },
  {
    id: 'kbeocfAqZpMV',
    name: 'R&B',
  },
  {
    id: 'esZXU5RqdIXA',
    name: 'Roots Reggae',
  },
  {
    id: 'SS5IZT210r09',
    name: 'Skate Punk',
  },
  {
    id: '0jN0cTgrCV-W',
    name: 'Stoner Metal',
  },
  {
    id: 'y_WwzT1yCG4T',
    name: 'Synth Punk',
  },
  {
    id: 'XSMZaMdcrxIq',
    name: 'Tribal Ambient',
  },
  {
    id: 'e0hQIguzaOIl',
    name: 'Free Improvisation',
  },
  {
    id: 'tYKVnsvbkzGo',
    name: 'Funk Rock',
  },
  {
    id: 'iGtABer2khR8',
    name: 'Gothic Metal',
  },
  {
    id: 'z9GpH6C97M6n',
    name: 'Heavy Metal',
  },
  {
    id: 'I2bAw1I0-reY',
    name: 'Indie Folk',
  },
  {
    id: 'yxsgI46DkSH4',
    name: 'Instrumental Hip Hop',
  },
  {
    id: 'KnFsAlpGw4On',
    name: 'K-Pop',
  },
  {
    id: '6kfFAgKT62BX',
    name: 'Math Rock',
  },
  {
    id: 'YHTh1MhpvzsV',
    name: 'Midwest Emo',
  },
  {
    id: 't-D8t-dbs8kI',
    name: 'Neo-Soul',
  },
  {
    id: 'ewAIM7ILhkQK',
    name: 'Noise Rock',
  },
  {
    id: 'i6UTTovIGzb3',
    name: 'Pop Rap',
  },
  {
    id: 'CPKh4eONEtC5',
    name: 'Post-Punk',
  },
  {
    id: 'fpzgkvNfIl47',
    name: 'Power Metal',
  },
  {
    id: 'Tnqe379tX9dA',
    name: 'Psychedelic',
  },
  {
    id: 'WkKbb8d0ms2f',
    name: 'Reggae',
  },
  {
    id: 'JHwACJB8Kuib',
    name: 'Shoegaze',
  },
  {
    id: 'DLgZ-Sjnmg3a',
    name: 'Southern Rock',
  },
  {
    id: 'odKMt8rLxrgk',
    name: 'Surf Rock',
  },
  {
    id: 'WTbpoezUUwRB',
    name: 'Thrash Metal',
  },
  {
    id: 'aPTKfrnEUv9d',
    name: 'Trip Hop',
  },
  {
    id: 'lmffS45DLUuV',
    name: 'Vaporwave',
  },
  {
    id: 'FvaG_Xq_26a1',
    name: 'Acid House',
  },
  {
    id: '0m3GS12vFNJX',
    name: 'Future Garage',
  },
  {
    id: 'ImOrWhJ5_ZYv',
    name: 'Grime',
  },
  {
    id: '5imOKCx0jW6a',
    name: 'Hip House',
  },
  {
    id: 'duuYzzKPzJtc',
    name: 'Indietronica',
  },
  {
    id: 'EmnZ8I8t9jW4',
    name: 'Jazz-Funk',
  },
  {
    id: 'N3YmmxzVY9q4',
    name: 'Latin Rock',
  },
  {
    id: 'CFbi4nGVuD3d',
    name: 'Microhouse',
  },
  {
    id: 'T3zixA-u4yaA',
    name: 'Musique concrète',
  },
  {
    id: 'namp8bm2oZ03',
    name: 'New Wave',
  },
  {
    id: 'NPAExKapo330',
    name: 'Pagan Metal',
  },
  {
    id: 'Hg9OWsb-CFmO',
    name: 'Pop Rock',
  },
  {
    id: 'NhuuRzjL77Hp',
    name: 'Progressive Rock',
  },
  {
    id: 'L9R6LBbdU3mj',
    name: 'Psychedelic Rock',
  },
  {
    id: 'XcKj-yFMJkgZ',
    name: 'Roots Rock',
  },
  {
    id: 's5p0GoaJDZoN',
    name: 'Soft Rock',
  },
  {
    id: 'BuRUsA9fTI7_',
    name: 'Stoner Rock',
  },
  {
    id: '_EmcGjALf-b7',
    name: 'Techno',
  },
  {
    id: 'SdkKIqDRQPJ9',
    name: 'Turntablism',
  },
  {
    id: 'lPFehAgRI4h1',
    name: 'French House',
  },
  {
    id: 'wNMAbXbXEnBQ',
    name: 'Future Bass',
  },
  {
    id: 'f_7WEkQmpx3z',
    name: 'Gospel',
  },
  {
    id: 'HuxUOrpzuq2w',
    name: 'Heartland Rock',
  },
  {
    id: 'Aq2Lw-vDzDWR',
    name: 'House',
  },
  {
    id: 'Nj7oIvxQRC9p',
    name: 'Industrial Techno',
  },
  {
    id: 'T3XJ3yZAOh85',
    name: 'Jazz-Rock',
  },
  {
    id: 'iUj-Fafbu5cc',
    name: 'Mariachi',
  },
  {
    id: 'pzZQNUCCg84A',
    name: 'Minimal',
  },
  {
    id: 'kT7l4QCvBzse',
    name: 'Neo-Psychedelia',
  },
  {
    id: 'aYa2wzFxvtj6',
    name: 'Nu Jazz',
  },
  {
    id: 'F9jFJY8dCtIl',
    name: 'Pop Reggae',
  },
  {
    id: 'TVja92bPs-jK',
    name: 'Post-Rock',
  },
  {
    id: 'E9RuIg0OBBx3',
    name: 'Protopunk',
  },
  {
    id: 'Nq0MhaCO9GZm',
    name: 'Rap Rock',
  },
  {
    id: 'XHAuHllIAnSz',
    name: 'Screamo',
  },
  {
    id: 'I1uu9PKbEDQF',
    name: 'Space Ambient',
  },
  {
    id: 'V9uXUI2EbpxT',
    name: 'Synthpop',
  },
  {
    id: '8tKijd2g6BE6',
    name: 'Trance',
  },
  {
    id: 'uaUmYY0HkN9d',
    name: 'UK Bass',
  },
  {
    id: 'hpMxijUbrAoy',
    name: 'Yé-yé',
  },
  {
    id: 'BXwhTqxyF4RC',
    name: 'Free Jazz',
  },
  {
    id: 'atNWE_CHi3M1',
    name: 'Garage Rock',
  },
  {
    id: 'hRZtwJ5dPO2g',
    name: 'Glitch',
  },
  {
    id: '5GBY4oPHtekQ',
    name: 'Grunge',
  },
  {
    id: '3g91qMZC57h0',
    name: 'Hardcore Punk',
  },
  {
    id: '9CZ60xUD_Up5',
    name: 'IDM',
  },
  {
    id: 's163d8C6OStE',
    name: 'Jazz',
  },
  {
    id: 'd_vibe_4ibEj',
    name: 'Latin Pop',
  },
  {
    id: 'X1PIxJMqqJX5',
    name: 'Melodic Hardcore',
  },
  {
    id: 'r5G-sRcxSeUk',
    name: 'Minimal Techno',
  },
  {
    id: 'SsLRmYLxnEp8',
    name: 'Neofolk',
  },
  {
    id: 'WzgSNCNfht2N',
    name: 'Nu-Disco',
  },
  {
    id: '6OghOFC621f0',
    name: 'Post-Grunge',
  },
  {
    id: 'j5z39d1anZ84',
    name: 'Progressive House',
  },
  {
    id: 'WdzUf7u1YYVN',
    name: 'Psychedelic Pop',
  },
  {
    id: 'IAt0g1H7qS8W',
    name: 'Rock & Roll',
  },
  {
    id: 'BGAL_XNjElfi',
    name: 'Sertanejo',
  },
  {
    id: 'Hy3jfnXLqWH4',
    name: 'Soul',
  },
  {
    id: 'ateOZfAeYRFB',
    name: 'Space Rock',
  },
  {
    id: 'xZJI9TKNMf5H',
    name: 'Symphonic Prog',
  },
  {
    id: '3-3gGMauvOM8',
    name: 'Traditional Pop',
  },
  {
    id: 'ZVnl24mImvCa',
    name: 'Twee Pop',
  },
  {
    id: 'C6aBkmyUxnn-',
    name: 'World',
  },
  {
    id: 'K-ooYwXs-uKl',
    name: 'Acoustic Rock',
  },
  {
    id: '69HIVoYlx1Pt',
    name: 'Funk Metal',
  },
  {
    id: '3H5G0f9NUnHY',
    name: 'Gothic Rock',
  },
  {
    id: 'i-vQ09aKAtOG',
    name: 'Industrial Hip Hop',
  },
  {
    id: 'NFe-K_3OkdjA',
    name: 'Jam Band',
  },
  {
    id: 'ij-Za6oGI5B8',
    name: 'Krautrock',
  },
  {
    id: '8wbpveCV4e6K',
    name: 'Mathcore',
  },
  {
    id: 'p0kYWK8NxmBJ',
    name: 'Minimalism',
  },
  {
    id: '9oQ3CYjmnt2w',
    name: 'New Jack Swing',
  },
  {
    id: 'AUJRMDstYOUQ',
    name: 'Pop',
  },
  {
    id: '8JC_E3IBjT_h',
    name: 'Post-Punk Revival',
  },
  {
    id: 'enfmyfM-uvU1',
    name: 'Power Pop',
  },
  {
    id: 'erPodFgk0XqK',
    name: 'Psychedelic Soul',
  },
  {
    id: 'Fa-kFQ3hilWN',
    name: 'Rock Opera',
  },
  {
    id: 'ja1kPw5dP9ot',
    name: 'Slowcore',
  },
  {
    id: 'dLRQROzETC49',
    name: 'Spoken Word',
  },
  {
    id: 'kTqjYhAIyVSD',
    name: 'Technical Death Metal',
  },
  {
    id: 'Q4axhzz2AIT6',
    name: 'Tropical House',
  },
  {
    id: '5cwcIht0Bxxh',
    name: 'Vocal Jazz',
  },
  {
    id: 'LOxyJSX3fAyi',
    name: 'French Pop',
  },
  {
    id: '8M-Q6CGSHNLB',
    name: 'Gangsta Rap',
  },
  {
    id: 'Q6r5-4XFz7nl',
    name: 'Glitch Hop',
  },
  {
    id: 'tYu0QeaoN-eB',
    name: 'Hardcore Breaks',
  },
  {
    id: 'NLo0PgAWuBWb',
    name: 'Industrial',
  },
  {
    id: 'nhMsj83RQMGa',
    name: 'Jazz Fusion',
  },
  {
    id: '2KN6P5TXXRxH',
    name: 'Latin Alternative',
  },
  {
    id: 's2WpcwWGwdjh',
    name: 'Melodic Death Metal',
  },
  {
    id: 'CDBkV53puWxk',
    name: 'Modern Classical',
  },
  {
    id: '8ay4dPhLpiC9',
    name: 'Noise',
  },
  {
    id: 'PmTHA8ZY4UMn',
    name: 'Piano Rock',
  },
  {
    id: '0R-mPR27I1wg',
    name: 'Pop Soul',
  },
  {
    id: 'XATujP0kzrLy',
    name: 'Progressive Folk',
  },
  {
    id: 'FscKKdF8rFT_',
    name: 'Punk Rock',
  },
  {
    id: 'cBerTj0ZYkcF',
    name: 'Rock',
  },
  {
    id: 'Lbt1D-7xIYv2',
    name: 'Ska',
  },
  {
    id: '4JALLRhDFKnq',
    name: 'Sound Collage',
  },
  {
    id: 'TtHNHf0QvzON',
    name: 'Symphonic Metal',
  },
  {
    id: '25zo6ghJvVRb',
    name: 'Tishoumaren',
  },
  {
    id: 'XL2qd14uDmPW',
    name: 'Tropicália',
  },
  {
    id: 'QTS2raH8a9io',
    name: 'Wonky',
  },
  {
    id: 'IbcUGgFWwTn_',
    name: 'Afrobeat',
  },
  {
    id: '2oxuHLK2PTyR',
    name: 'Glam Metal',
  },
  {
    id: 'ustRyZliJ4Mx',
    name: 'Groove Metal',
  },
  {
    id: 'vYcTeZZaPbx6',
    name: 'Heavy Psych',
  },
  {
    id: '4O6h4Yt9pn-M',
    name: 'Hypnagogic Pop',
  },
  {
    id: 'sRasiPqFXu_o',
    name: 'Industrial Rock',
  },
  {
    id: 'NDKK4CDOwBF2',
    name: 'Juke',
  },
  {
    id: 'FAWX2QtJcUnC',
    name: 'Mashup',
  },
  {
    id: 'E1_QlJZ_a505',
    name: 'Minimal Synth',
  },
  {
    id: 'Q7r_4g4KQzWk',
    name: 'Neoclassical Darkwave',
  },
  {
    id: '4BLIEr3PgTzO',
    name: 'Nu Metal',
  },
  {
    id: 'jLGaymi5O_Pe',
    name: 'Post-Industrial',
  },
  {
    id: 'x_PuSGtbzayC',
    name: 'Progressive Electronic',
  },
  {
    id: '3z08TW03hHWV',
    name: 'Psychobilly',
  },
  {
    id: 'q0_ZlASkvs0m',
    name: 'Samba',
  },
  {
    id: 'O6sFR9kVpRrx',
    name: 'Sludge Metal',
  },
  {
    id: 'YTqL10UlnnLf',
    name: 'Standards',
  },
  {
    id: 'mqOF_vgpPw0t',
    name: 'Tech House',
  },
  {
    id: 'cM600ul9S4Pv',
    name: 'Trap Rap',
  },
  {
    id: 'e8o3PD9t7FU7',
    name: 'Witch House',
  },
  {
    id: 'nkElKVs3ZMhJ',
    name: 'Hyperpop',
  },
  {
    id: 'm8bRV2QLlpOY',
    name: 'Contemporary R&B',
  },
  {
    id: 'f4Y7tNGWmcWe',
    name: 'Desert Rock',
  },
  {
    id: 'QXhE07EMTQr4',
    name: 'Southern Hip Hop',
  },
  {
    id: 'jTdcMrzlQsdz',
    name: 'Free Folk',
  },
  {
    id: 'KhtjczGEFWn0',
    name: 'Funk',
  },
  {
    id: 'vw4rGWfDYjha',
    name: 'Glam Rock',
  },
  {
    id: 'AwsVqZX3RfBh',
    name: 'Hard Rock',
  },
  {
    id: 'Vpe7Wtwe6sPy',
    name: 'Hardcore Hip Hop',
  },
  {
    id: 'sgH95SWdPNCv',
    name: 'Horrorcore',
  },
  {
    id: '-yeD0x0CBlIA',
    name: 'Industrial Metal',
  },
  {
    id: 'jug8Pzb37rTV',
    name: 'Jazz Rap',
  },
  {
    id: '7D2HDDQu0K-p',
    name: 'Latin Electronic',
  },
  {
    id: '9DsbUN6Gtk8T',
    name: 'Metalcore',
  },
  {
    id: '6IgrD5DGrHfj',
    name: 'MPB',
  },
  {
    id: 's49SniTgrkOp',
    name: 'No Wave',
  },
  {
    id: '1R2VAFIedHbH',
    name: 'Plunderphonics',
  },
  {
    id: 'At8e2b8nxjHT',
    name: 'Post-Hardcore',
  },
  {
    id: '_eaLXJK8-NvK',
    name: 'Progressive Metal',
  },
  {
    id: 'dQ_BF08mJzWi',
    name: 'Punk',
  },
  {
    id: '3mKd8XpJxsSB',
    name: 'Rockabilly',
  },
  {
    id: 'rw60mzKKjihy',
    name: 'Sophisti-Pop',
  },
  {
    id: 'Gzgz5nSiX2kb',
    name: 'Sunshine Pop',
  },
  {
    id: 'Mp2X0YHZfB3o',
    name: 'Synth Funk',
  },
  {
    id: 'eSNWMnQwdS8K',
    name: 'Trap',
  },
  {
    id: 'dv6yzFQkz3Ht',
    name: 'UK Garage',
  },
  {
    id: 'PoYkDi78zbxg',
    name: 'Yacht Rock',
  },
  {
    id: 'pJ0bsZrb0AIv',
    name: 'Hard Bop',
  },
  {
    id: 'qTmr_N5rPSXJ',
    name: 'Big Band',
  },
  {
    id: 'DKxd1ABKUk-x',
    name: 'Post-Bop',
  },
  {
    id: 'CVl-6aqiYTdL',
    name: 'Third Stream',
  },
  {
    id: 'uTsYi1jf51yW',
    name: 'Spiritual Jazz',
  },
  {
    id: 'UUNJ7y1Vl4II',
    name: 'Digicore',
  },
];

export class Init1726018337091 implements MigrationInterface {
  name = 'Init1726018337091';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "release_genre_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "releaseGenreId" character varying NOT NULL, "type" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_04cfa777aa258d06f9c060ebf4d" UNIQUE ("userId", "releaseGenreId"), CONSTRAINT "PK_3f750351b817ad8e386a70c603d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_comment" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "listId" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff397b2d24fd99393e57559d0d6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_like" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "listId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_639c0976042853884b25a26d2db" UNIQUE ("userId", "listId"), CONSTRAINT "PK_08d899a0a4870c8959ddf52a604" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "list" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "ranked" boolean NOT NULL DEFAULT false, "grid" boolean NOT NULL DEFAULT false, "published" boolean NOT NULL DEFAULT false, "publishedDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d8feafd203525d5f9c37b3ed3b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "list_item" ("id" character varying NOT NULL, "listId" character varying NOT NULL, "releaseId" character varying NOT NULL, "index" integer NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c8ce68170d7087b09ae88f85432" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "artist" ("id" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_55b76e71568b5db4d01d3e394ed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_artist" ("artistId" character varying NOT NULL, "releaseId" character varying NOT NULL, CONSTRAINT "PK_14a53e8eb79b2e0000dfd52ff27" PRIMARY KEY ("artistId", "releaseId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "label_submission_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "labelSubmissionId" character varying NOT NULL, "type" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8b95ee9f67aa228b04a2be5b296" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "label_submission" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "labelId" character varying, "changes" text NOT NULL, "submissionType" integer NOT NULL, "submissionStatus" integer NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bd771630dc895041eb7d66dcdd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "label" ("id" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5692ac5348861d3776eb5843672" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_label" ("labelId" character varying NOT NULL, "releaseId" character varying NOT NULL, CONSTRAINT "PK_6baf3d8566dc3ec9a2ca9b470ce" PRIMARY KEY ("labelId", "releaseId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "language" ("id" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_cc0a99e710eb3733f6fb42b1d4c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_language" ("languageId" character varying NOT NULL, "releaseId" character varying NOT NULL, CONSTRAINT "PK_243bdfb7eff935866dd21ee442e" PRIMARY KEY ("languageId", "releaseId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_submission_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "releaseSubmissionId" character varying NOT NULL, "type" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9fbb9f2e1ffadf2d6b8160d562c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_submission" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "releaseId" character varying, "changes" text NOT NULL, "submissionType" integer NOT NULL, "submissionStatus" integer NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a67bc2b2a10133fce660f028111" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rating" ("id" character varying NOT NULL, "rating" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_9d9e6e94d6af603e892596cd74" CHECK ("rating" >= 0 AND "rating" <= 100), CONSTRAINT "PK_ecda8ad32645327e4765b43649e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_comment" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "reviewId" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_81a77699383553c51a2d444a8a9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "reviewId" character varying NOT NULL, "vote" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0279a09a8855cf2108365616b72" UNIQUE ("userId", "reviewId"), CONSTRAINT "PK_d8afb9d60b9eb3491795ec306b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "review" ("id" character varying NOT NULL, "body" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_release_tag" ("id" character varying NOT NULL, "tag" character varying NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_781c64fb0a919b0d75421cf7800" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_release" ("id" character varying NOT NULL, "releaseId" character varying NOT NULL, "userId" character varying NOT NULL, "reviewId" character varying, "ratingId" character varying, "hasTrackVotes" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c34fc4254ddf1128cb411148839" UNIQUE ("releaseId", "userId"), CONSTRAINT "REL_c731357abd9b7519b0f066f5ba" UNIQUE ("reviewId"), CONSTRAINT "REL_30ae448f1bc2a30dc3312f0bba" UNIQUE ("ratingId"), CONSTRAINT "PK_e116e7c0a3e09b81b2c9c27d4ac" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "track_vote" ("id" character varying NOT NULL, "trackId" character varying NOT NULL, "userReleaseId" character varying NOT NULL, "vote" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1467e39e6b1c363512dd5218956" UNIQUE ("userReleaseId", "trackId"), CONSTRAINT "PK_5d2b95c2602e8570527dc03ca21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "track" ("id" character varying NOT NULL, "releaseId" character varying NOT NULL, "track" character varying NOT NULL, "order" integer NOT NULL, "title" character varying NOT NULL, "durationMs" integer, CONSTRAINT "PK_0631b9bcf521f8fab3a15f2c37e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release" ("id" character varying NOT NULL, "title" character varying NOT NULL, "type" integer NOT NULL, "date" date, "imagePath" text, "spotifyId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1a2253436964eea9c558f9464f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "release_genre" ("id" character varying NOT NULL, "genreId" character varying NOT NULL, "releaseId" character varying NOT NULL, "votesAvg" double precision NOT NULL, "votesCount" integer NOT NULL, CONSTRAINT "UQ_0b508445645c0b77c74a795ea9f" UNIQUE ("genreId", "releaseId"), CONSTRAINT "PK_2e651eb32ee774d249ad8d94b27" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genre" ("id" character varying NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "genre_submission" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "genreId" character varying, "changes" text NOT NULL, "submissionType" integer NOT NULL, "submissionStatus" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c47b98ce235177fc6227673718a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_following" ("id" character varying NOT NULL, "followerId" character varying NOT NULL, "followingId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4c29c3c6063e27a589692e45853" UNIQUE ("followerId", "followingId"), CONSTRAINT "PK_287466a3eb23d4ad30a67cb8665" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_support" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "amount" double precision NOT NULL, "date" date NOT NULL, CONSTRAINT "PK_a9c577748d8e096fb3a9ae69ae6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" character varying NOT NULL, "username" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" text NOT NULL, "imagePath" text, "bio" text, "contributorStatus" integer NOT NULL DEFAULT '20', "confirmed" boolean NOT NULL DEFAULT false, "supporter" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `,
    );
    await queryRunner.query(
      `CREATE TABLE "artist_submission_vote" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "artistSubmissionId" character varying NOT NULL, "type" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d7dfda862fc652df901e8b512d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "artist_submission" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "artistId" character varying, "changes" text NOT NULL, "submissionType" integer NOT NULL, "submissionStatus" integer NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4eae8d1f3e1c80004bc82e5e496" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_release_user_tag" ("user_release_id" character varying NOT NULL, "user_release_tag_id" character varying NOT NULL, CONSTRAINT "PK_7e2878b2d3c59fb3859ea682629" PRIMARY KEY ("user_release_id", "user_release_tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6b243470c4648e6123cdc620f2" ON "user_release_user_tag" ("user_release_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94d61d4e26c0557fdde67e1b56" ON "user_release_user_tag" ("user_release_tag_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre_vote" ADD CONSTRAINT "FK_a7cfe3ab7a835ed61466707b46a" FOREIGN KEY ("releaseGenreId") REFERENCES "release_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre_vote" ADD CONSTRAINT "FK_6e159f8887d1e273bc640a7c3dc" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" ADD CONSTRAINT "FK_7ac82ef2f8c787fcbab3ecd7ad8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" ADD CONSTRAINT "FK_1f1eb8e3b0abe67c2c305b8d5e7" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_like" ADD CONSTRAINT "FK_2f7811183028e0c3b9a66f34957" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_like" ADD CONSTRAINT "FK_36bbfd04f2ebcc31a9c42450c36" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list" ADD CONSTRAINT "FK_46ded14b26382088c9f032f8953" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_item" ADD CONSTRAINT "FK_89a46892e58c831d817b2dca8f7" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_item" ADD CONSTRAINT "FK_39eaff5b58edb6c35e9ac11e2b2" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_artist" ADD CONSTRAINT "FK_283d5c2f0e7bfc289a59ce134e5" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_artist" ADD CONSTRAINT "FK_cb6cab2aea5dcf925ab326455b6" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission_vote" ADD CONSTRAINT "FK_88caad7fa0d140681102eab133f" FOREIGN KEY ("labelSubmissionId") REFERENCES "label_submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission_vote" ADD CONSTRAINT "FK_2eb24124559a64df6294c95f453" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission" ADD CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission" ADD CONSTRAINT "FK_880c33eaa0074c8f9fd5910a0c9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_label" ADD CONSTRAINT "FK_d7f401f087d13a0ad91592a945e" FOREIGN KEY ("labelId") REFERENCES "label"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_label" ADD CONSTRAINT "FK_90186fed4f598461d0f0d09a4c9" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_language" ADD CONSTRAINT "FK_2b03715c7bb443f40aae2ea31da" FOREIGN KEY ("languageId") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_language" ADD CONSTRAINT "FK_225c47a9063efe03e976bc6241c" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission_vote" ADD CONSTRAINT "FK_585e3ccc0303b0a7b62811766ac" FOREIGN KEY ("releaseSubmissionId") REFERENCES "release_submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission_vote" ADD CONSTRAINT "FK_53236e74ac9a651267671514487" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission" ADD CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission" ADD CONSTRAINT "FK_0ab7ae63ee1c293161c5ed72397" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" ADD CONSTRAINT "FK_48d292fa20615320242c9efb527" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" ADD CONSTRAINT "FK_3c9d31f6121408a92687a262053" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_vote" ADD CONSTRAINT "FK_4de8aa192a7d2919b66ce83e6f8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_vote" ADD CONSTRAINT "FK_f714bf883874fbd00b52bf16407" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_tag" ADD CONSTRAINT "FK_bdd82b7277ea69e7c377b09aa4e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" ADD CONSTRAINT "FK_68a0d341f00f7877c3a4abff5c1" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" ADD CONSTRAINT "FK_3a7d0101df3ad46769d8888bc80" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" ADD CONSTRAINT "FK_c731357abd9b7519b0f066f5ba8" FOREIGN KEY ("reviewId") REFERENCES "review"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" ADD CONSTRAINT "FK_30ae448f1bc2a30dc3312f0bba1" FOREIGN KEY ("ratingId") REFERENCES "rating"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_vote" ADD CONSTRAINT "FK_bc252226cc90c3071d3a93bec9a" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_vote" ADD CONSTRAINT "FK_d1a094bc008f6c163e1a228063b" FOREIGN KEY ("userReleaseId") REFERENCES "user_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "track" ADD CONSTRAINT "FK_82f53ac4b0335b49d639927e219" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre" ADD CONSTRAINT "FK_ff79c5ad864645b703cccb0fdfc" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre" ADD CONSTRAINT "FK_f743827e7500c17373e57c8542f" FOREIGN KEY ("releaseId") REFERENCES "release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_submission" ADD CONSTRAINT "FK_0b93f771d2ebbbec5381c449d82" FOREIGN KEY ("genreId") REFERENCES "genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_submission" ADD CONSTRAINT "FK_b3ef40d97e2b632d3f0517e31ab" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following" ADD CONSTRAINT "FK_a2dce8d9c1c4b5cbc8d6e5fc399" FOREIGN KEY ("followerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following" ADD CONSTRAINT "FK_b88ad49e84034c506d3c0ae7422" FOREIGN KEY ("followingId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_support" ADD CONSTRAINT "FK_bc2e1a1196b6e4c0719149118c5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission_vote" ADD CONSTRAINT "FK_d0e5aff66fa75b9d3fc34cf6a33" FOREIGN KEY ("artistSubmissionId") REFERENCES "artist_submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission_vote" ADD CONSTRAINT "FK_5202ea4ecccab2c64d97b216fdd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission" ADD CONSTRAINT "FK_2e98c208216dfb7701f89aa335d" FOREIGN KEY ("artistId") REFERENCES "artist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission" ADD CONSTRAINT "FK_af974125ea7bf1842ea7d3ac1ed" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_user_tag" ADD CONSTRAINT "FK_6b243470c4648e6123cdc620f24" FOREIGN KEY ("user_release_id") REFERENCES "user_release"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_user_tag" ADD CONSTRAINT "FK_94d61d4e26c0557fdde67e1b56c" FOREIGN KEY ("user_release_tag_id") REFERENCES "user_release_tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `INSERT INTO "language" ("id", "name") VALUES
            ('aD-xlrlTaHJT', 'English'),
            ('1xoBH7Q2uUV-', 'French'),
            ('tNLosmHZEVGX', 'Spanish'),
            ('BrRd2mw59oWl', 'Arabic'),
            ('2WnUTslMlldX', 'Mandarin'),
            ('UWezkaDj0zp-', 'Russian'),
            ('mR2zXT9Hhy9V', 'Portuguese'),
            ('3-4btqAATELx', 'German'),
            ('CxAwXFu7NhoE', 'Japanese'),
            ('08-VGtLJxG01', 'Hindi'),
            ('5mQ6w9b8Aftd', 'Malay'),
            ('c4am4iEozQ_p', 'Persian'),
            ('DADAhpeFZt_v', 'Swahili'),
            ('Iqvn_lqaryn9', 'Tamil'),
            ('Ek4lT4qxEj4B', 'Italian'),
            ('1l3t-onFK5Jy', 'Dutch'),
            ('-NUOusGM9TC6', 'Bengali'),
            ('08GF3KX6tmJR', 'Turkish'),
            ('ofzJFUaCh-zR', 'Vietnamese'),
            ('q7GnfSi6UKlE', 'Polish'),
            ('sNsBhrFx8VLF', 'Javanese'),
            ('faisXOPH7XYi', 'Punjabi'),
            ('9l1vn8O5XDQx', 'Thai'),
            ('GPxXSdyniyp-', 'Korean');`,
    );
    await queryRunner.query(
      `INSERT INTO "genre" ("id", "name") VALUES
            ${genres.map((genre) => `('${genre.id}', '${genre.name.replace(/'/g, "''")}')`).join(', ')};`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "genre" WHERE "id" IN (
            ${genres.map((genre) => `'${genre.id}'`).join(', ')}
          );`,
    );
    await queryRunner.query(
      `DELETE FROM "language" WHERE "id" IN (
            'aD-xlrlTaHJT', '1xoBH7Q2uUV-', 'tNLosmHZEVGX', 'BrRd2mw59oWl', '2WnUTslMlldX', 'UWezkaDj0zp-', 
            'mR2zXT9Hhy9V', '3-4btqAATELx', 'CxAwXFu7NhoE', '08-VGtLJxG01', '5mQ6w9b8Aftd', 'c4am4iEozQ_p', 
            'DADAhpeFZt_v', 'Iqvn_lqaryn9', 'Ek4lT4qxEj4B', '1l3t-onFK5Jy', '-NUOusGM9TC6', '08GF3KX6tmJR', 
            'ofzJFUaCh-zR', 'q7GnfSi6UKlE', 'sNsBhrFx8VLF', 'faisXOPH7XYi', '9l1vn8O5XDQx', 'GPxXSdyniyp-');`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_user_tag" DROP CONSTRAINT "FK_94d61d4e26c0557fdde67e1b56c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_user_tag" DROP CONSTRAINT "FK_6b243470c4648e6123cdc620f24"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission" DROP CONSTRAINT "FK_af974125ea7bf1842ea7d3ac1ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission" DROP CONSTRAINT "FK_2e98c208216dfb7701f89aa335d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission_vote" DROP CONSTRAINT "FK_5202ea4ecccab2c64d97b216fdd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "artist_submission_vote" DROP CONSTRAINT "FK_d0e5aff66fa75b9d3fc34cf6a33"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_support" DROP CONSTRAINT "FK_bc2e1a1196b6e4c0719149118c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following" DROP CONSTRAINT "FK_b88ad49e84034c506d3c0ae7422"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_following" DROP CONSTRAINT "FK_a2dce8d9c1c4b5cbc8d6e5fc399"`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_submission" DROP CONSTRAINT "FK_b3ef40d97e2b632d3f0517e31ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "genre_submission" DROP CONSTRAINT "FK_0b93f771d2ebbbec5381c449d82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre" DROP CONSTRAINT "FK_f743827e7500c17373e57c8542f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre" DROP CONSTRAINT "FK_ff79c5ad864645b703cccb0fdfc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track" DROP CONSTRAINT "FK_82f53ac4b0335b49d639927e219"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_vote" DROP CONSTRAINT "FK_d1a094bc008f6c163e1a228063b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "track_vote" DROP CONSTRAINT "FK_bc252226cc90c3071d3a93bec9a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" DROP CONSTRAINT "FK_30ae448f1bc2a30dc3312f0bba1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" DROP CONSTRAINT "FK_c731357abd9b7519b0f066f5ba8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" DROP CONSTRAINT "FK_3a7d0101df3ad46769d8888bc80"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release" DROP CONSTRAINT "FK_68a0d341f00f7877c3a4abff5c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_release_tag" DROP CONSTRAINT "FK_bdd82b7277ea69e7c377b09aa4e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_vote" DROP CONSTRAINT "FK_f714bf883874fbd00b52bf16407"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_vote" DROP CONSTRAINT "FK_4de8aa192a7d2919b66ce83e6f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" DROP CONSTRAINT "FK_3c9d31f6121408a92687a262053"`,
    );
    await queryRunner.query(
      `ALTER TABLE "review_comment" DROP CONSTRAINT "FK_48d292fa20615320242c9efb527"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission" DROP CONSTRAINT "FK_0ab7ae63ee1c293161c5ed72397"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission" DROP CONSTRAINT "FK_ae38778f59c0a95b6902f22f4dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission_vote" DROP CONSTRAINT "FK_53236e74ac9a651267671514487"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_submission_vote" DROP CONSTRAINT "FK_585e3ccc0303b0a7b62811766ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_language" DROP CONSTRAINT "FK_225c47a9063efe03e976bc6241c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_language" DROP CONSTRAINT "FK_2b03715c7bb443f40aae2ea31da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_label" DROP CONSTRAINT "FK_90186fed4f598461d0f0d09a4c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_label" DROP CONSTRAINT "FK_d7f401f087d13a0ad91592a945e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission" DROP CONSTRAINT "FK_880c33eaa0074c8f9fd5910a0c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission" DROP CONSTRAINT "FK_1df831a724ba4c72f891bb9cd10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission_vote" DROP CONSTRAINT "FK_2eb24124559a64df6294c95f453"`,
    );
    await queryRunner.query(
      `ALTER TABLE "label_submission_vote" DROP CONSTRAINT "FK_88caad7fa0d140681102eab133f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_artist" DROP CONSTRAINT "FK_cb6cab2aea5dcf925ab326455b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_artist" DROP CONSTRAINT "FK_283d5c2f0e7bfc289a59ce134e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_item" DROP CONSTRAINT "FK_39eaff5b58edb6c35e9ac11e2b2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_item" DROP CONSTRAINT "FK_89a46892e58c831d817b2dca8f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list" DROP CONSTRAINT "FK_46ded14b26382088c9f032f8953"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_like" DROP CONSTRAINT "FK_36bbfd04f2ebcc31a9c42450c36"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_like" DROP CONSTRAINT "FK_2f7811183028e0c3b9a66f34957"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" DROP CONSTRAINT "FK_1f1eb8e3b0abe67c2c305b8d5e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "list_comment" DROP CONSTRAINT "FK_7ac82ef2f8c787fcbab3ecd7ad8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre_vote" DROP CONSTRAINT "FK_6e159f8887d1e273bc640a7c3dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "release_genre_vote" DROP CONSTRAINT "FK_a7cfe3ab7a835ed61466707b46a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94d61d4e26c0557fdde67e1b56"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6b243470c4648e6123cdc620f2"`,
    );
    await queryRunner.query(`DROP TABLE "user_release_user_tag"`);
    await queryRunner.query(`DROP TABLE "artist_submission"`);
    await queryRunner.query(`DROP TABLE "artist_submission_vote"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_support"`);
    await queryRunner.query(`DROP TABLE "user_following"`);
    await queryRunner.query(`DROP TABLE "genre_submission"`);
    await queryRunner.query(`DROP TABLE "genre"`);
    await queryRunner.query(`DROP TABLE "release_genre"`);
    await queryRunner.query(`DROP TABLE "release"`);
    await queryRunner.query(`DROP TABLE "track"`);
    await queryRunner.query(`DROP TABLE "track_vote"`);
    await queryRunner.query(`DROP TABLE "user_release"`);
    await queryRunner.query(`DROP TABLE "user_release_tag"`);
    await queryRunner.query(`DROP TABLE "review"`);
    await queryRunner.query(`DROP TABLE "review_vote"`);
    await queryRunner.query(`DROP TABLE "review_comment"`);
    await queryRunner.query(`DROP TABLE "rating"`);
    await queryRunner.query(`DROP TABLE "release_submission"`);
    await queryRunner.query(`DROP TABLE "release_submission_vote"`);
    await queryRunner.query(`DROP TABLE "release_language"`);
    await queryRunner.query(`DROP TABLE "language"`);
    await queryRunner.query(`DROP TABLE "release_label"`);
    await queryRunner.query(`DROP TABLE "label"`);
    await queryRunner.query(`DROP TABLE "label_submission"`);
    await queryRunner.query(`DROP TABLE "label_submission_vote"`);
    await queryRunner.query(`DROP TABLE "release_artist"`);
    await queryRunner.query(`DROP TABLE "artist"`);
    await queryRunner.query(`DROP TABLE "list_item"`);
    await queryRunner.query(`DROP TABLE "list"`);
    await queryRunner.query(`DROP TABLE "list_like"`);
    await queryRunner.query(`DROP TABLE "list_comment"`);
    await queryRunner.query(`DROP TABLE "release_genre_vote"`);
  }
}
