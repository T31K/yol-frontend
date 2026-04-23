export type Lang = 'en' | 'de' | 'ja' | 'fr'

export const translations = {
  en: {
    // Settings dropdown
    settings: 'Settings',
    logIn: 'Log in',
    signOut: 'Sign out',
    manageData: 'Manage data',
    helpShortcuts: 'Help & shortcuts',
    featureRequests: 'Feature requests',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    language: 'Language',

    // Auth
    signIn: 'Sign in',
    register: 'Register',
    createAccount: 'Create account',
    continueWithGoogle: 'Continue with Google',
    email: 'Email',
    passwordMin: 'Password (min 6 chars)',
    or: 'or',

    // Data dialog
    manageDataTitle: 'Manage data',
    exportDesc: 'Export your playlists, folders, and history as a JSON backup file.',
    exportBackup: 'Export backup',
    importDesc: 'Restore from a previously exported backup file.',
    importBackup: 'Import backup',

    // Sidebar tabs
    playlists: 'Playlists',
    history: 'History',

    // Playlist actions
    newPlaylist: 'New Playlist',
    import: 'Import',
    newFolder: 'New Folder',
    newPlaylistTitle: 'New playlist',
    newFolderTitle: 'New folder',
    playlistNamePlaceholder: 'Playlist name…',
    folderNamePlaceholder: 'Folder name…',
    create: 'Create',
    back: 'Back',
    shuffle: 'Shuffle',
    emptyFolder: 'Empty folder',
    noPlaylists: 'No playlists yet',
    noSongsYet: "No songs yet. Add a video to this playlist while it's playing.",
    folder: 'Folder:',
    noFolder: 'No folder',
    addToPlaylist: 'Add to playlist',
    noPlaylistsYet: 'No playlists yet. Create one first.',

    // Import dialog
    importPlaylistTitle: 'Import YouTube Playlist',
    importPlaceholder: 'https://youtube.com/playlist?list=PL...',
    importInvalidUrl: 'Invalid URL. Paste a YouTube playlist link.',
    importFailed: 'Import failed',
    importNetworkError: 'Network error. Try again.',
    importedOn: 'Imported',

    // Controls
    volume: 'Volume',
    speed: 'Speed',
    loopCount: 'Loop count',
    loopCountTimes: 'times',
    unlimited: 'Unlimited',
    abLoop: 'A/B Loop',
    setStart: 'Set start',
    setEnd: 'Set end',
    clearLoop: 'Clear',
    addToPlaylistLabel: 'Add to playlist:',
    selectPlaylist: 'Select playlist…',
    createNewPlaylist: '+ Create new playlist',

    // Search
    searchPlaceholder: 'Search YouTube or paste a link…',
    searching: 'Searching…',

    // Help tips
    tipAddPlaylist: 'While a video is playing, use the "Add to playlist" dropdown below the controls.',
    tipOpenPlaylist: 'Click any playlist in the sidebar to see its songs. Click a song to play it.',

    // History
    clearHistory: 'Clear history',
    noHistory: 'No history yet',

    // Playlist loop
    loopPlaylist: 'Loop playlist',
    loopSong: 'Loop song',
    playingFrom: 'Playing from',

    // Playlist management
    deletePlaylist: 'Delete playlist',
    deletePlaylistConfirm: 'Delete this playlist?',
    renameSong: 'Rename',

    // Sharing
    share: 'Share',
    shareManagePublic: 'Manage public link',
    shareSignInPrompt: 'Sign in to share playlists publicly.',
    shareIntro: 'Make this playlist public to share it with anyone — your loop points are included.',
    shareNeedsVideos: 'Add a video first',
    makePublic: 'Make public',
    sharePublicNow: 'Public — anyone with the link can play it',
    copyLink: 'Copy link',
    republish: 'Republish',
    unpublish: 'Unpublish',

    // Channel search
    searchSongs: 'Songs',
    searchChannels: 'Channels',
    browseChannel: 'Browse videos',
    sortNewest: 'Latest',
    sortPopular: 'Popular',
    sortOldest: 'Oldest',
  },

  de: {
    // Settings dropdown
    settings: 'Einstellungen',
    logIn: 'Anmelden',
    signOut: 'Abmelden',
    manageData: 'Daten verwalten',
    helpShortcuts: 'Hilfe & Shortcuts',
    featureRequests: 'Feature-Anfragen',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    language: 'Sprache',

    // Auth
    signIn: 'Anmelden',
    register: 'Registrieren',
    createAccount: 'Konto erstellen',
    continueWithGoogle: 'Mit Google fortfahren',
    email: 'E-Mail',
    passwordMin: 'Passwort (mind. 6 Zeichen)',
    or: 'oder',

    // Data dialog
    manageDataTitle: 'Daten verwalten',
    exportDesc: 'Exportiere deine Playlists, Ordner und den Verlauf als JSON-Backup.',
    exportBackup: 'Backup exportieren',
    importDesc: 'Wiederherstellen aus einer zuvor exportierten Backup-Datei.',
    importBackup: 'Backup importieren',

    // Sidebar tabs
    playlists: 'Playlists',
    history: 'Verlauf',

    // Playlist actions
    newPlaylist: 'Neue Playlist',
    import: 'Importieren',
    newFolder: 'Neuer Ordner',
    newPlaylistTitle: 'Neue Playlist',
    newFolderTitle: 'Neuer Ordner',
    playlistNamePlaceholder: 'Playlist-Name…',
    folderNamePlaceholder: 'Ordnername…',
    create: 'Erstellen',
    back: 'Zurück',
    shuffle: 'Zufällig',
    emptyFolder: 'Leerer Ordner',
    noPlaylists: 'Noch keine Playlists',
    noSongsYet: 'Noch keine Songs. Füge ein Video zu dieser Playlist hinzu, während es abgespielt wird.',
    folder: 'Ordner:',
    noFolder: 'Kein Ordner',
    addToPlaylist: 'Zur Playlist hinzufügen',
    noPlaylistsYet: 'Noch keine Playlists. Erstelle zuerst eine.',

    // Import dialog
    importPlaylistTitle: 'YouTube-Playlist importieren',
    importPlaceholder: 'https://youtube.com/playlist?list=PL...',
    importInvalidUrl: 'Ungültige URL. Füge einen YouTube-Playlist-Link ein.',
    importFailed: 'Import fehlgeschlagen',
    importNetworkError: 'Netzwerkfehler. Erneut versuchen.',
    importedOn: 'Importiert',

    // Controls
    volume: 'Lautstärke',
    speed: 'Geschwindigkeit',
    loopCount: 'Wiederholungen',
    loopCountTimes: 'mal',
    unlimited: 'Unbegrenzt',
    abLoop: 'A/B-Schleife',
    setStart: 'Start setzen',
    setEnd: 'Ende setzen',
    clearLoop: 'Löschen',
    addToPlaylistLabel: 'Zur Playlist:',
    selectPlaylist: 'Playlist auswählen…',
    createNewPlaylist: '+ Neue Playlist erstellen',

    // Search
    searchPlaceholder: 'YouTube durchsuchen oder Link einfügen…',
    searching: 'Suche…',

    // Help tips
    tipAddPlaylist: 'Nutze das „Zur Playlist"-Dropdown unter den Steuerelementen, während ein Video läuft.',
    tipOpenPlaylist: 'Klicke auf eine Playlist in der Seitenleiste, um die Songs zu sehen. Klicke auf einen Song, um ihn abzuspielen.',

    // History
    clearHistory: 'Verlauf löschen',
    noHistory: 'Noch kein Verlauf',

    // Playlist loop
    loopPlaylist: 'Playlist wiederholen',
    loopSong: 'Song wiederholen',
    playingFrom: 'Aus',

    // Playlist management
    deletePlaylist: 'Playlist löschen',
    deletePlaylistConfirm: 'Diese Playlist löschen?',
    renameSong: 'Umbenennen',

    // Sharing
    share: 'Teilen',
    shareManagePublic: 'Öffentlichen Link verwalten',
    shareSignInPrompt: 'Melde dich an, um Playlists öffentlich zu teilen.',
    shareIntro: 'Mache diese Playlist öffentlich, um sie mit anderen zu teilen — deine Loop-Punkte sind enthalten.',
    shareNeedsVideos: 'Füge zuerst ein Video hinzu',
    makePublic: 'Öffentlich machen',
    sharePublicNow: 'Öffentlich — jeder mit dem Link kann sie abspielen',
    copyLink: 'Link kopieren',
    republish: 'Neu veröffentlichen',
    unpublish: 'Privat machen',

    // Channel search
    searchSongs: 'Songs',
    searchChannels: 'Kanäle',
    browseChannel: 'Videos ansehen',
    sortNewest: 'Neueste',
    sortPopular: 'Beliebt',
    sortOldest: 'Älteste',
  },

  ja: {
    // Settings dropdown
    settings: '設定',
    logIn: 'ログイン',
    signOut: 'サインアウト',
    manageData: 'データ管理',
    helpShortcuts: 'ヘルプ＆ショートカット',
    featureRequests: '機能リクエスト',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    language: '言語',

    // Auth
    signIn: 'サインイン',
    register: '登録',
    createAccount: 'アカウント作成',
    continueWithGoogle: 'Googleで続ける',
    email: 'メールアドレス',
    passwordMin: 'パスワード（6文字以上）',
    or: 'または',

    // Data dialog
    manageDataTitle: 'データ管理',
    exportDesc: 'プレイリスト、フォルダ、履歴をJSONバックアップとしてエクスポートします。',
    exportBackup: 'バックアップをエクスポート',
    importDesc: '以前エクスポートしたバックアップファイルから復元します。',
    importBackup: 'バックアップをインポート',

    // Sidebar tabs
    playlists: 'プレイリスト',
    history: '履歴',

    // Playlist actions
    newPlaylist: '新しいプレイリスト',
    import: 'インポート',
    newFolder: '新しいフォルダ',
    newPlaylistTitle: '新しいプレイリスト',
    newFolderTitle: '新しいフォルダ',
    playlistNamePlaceholder: 'プレイリスト名…',
    folderNamePlaceholder: 'フォルダ名…',
    create: '作成',
    back: '戻る',
    shuffle: 'シャッフル',
    emptyFolder: '空のフォルダ',
    noPlaylists: 'プレイリストがありません',
    noSongsYet: 'まだ曲がありません。動画の再生中にこのプレイリストに追加してください。',
    folder: 'フォルダ：',
    noFolder: 'フォルダなし',
    addToPlaylist: 'プレイリストに追加',
    noPlaylistsYet: 'プレイリストがありません。最初に作成してください。',

    // Import dialog
    importPlaylistTitle: 'YouTubeプレイリストをインポート',
    importPlaceholder: 'https://youtube.com/playlist?list=PL...',
    importInvalidUrl: '無効なURL。YouTubeプレイリストのリンクを貼り付けてください。',
    importFailed: 'インポートに失敗しました',
    importNetworkError: 'ネットワークエラー。もう一度お試しください。',
    importedOn: 'インポート済み',

    // Controls
    volume: '音量',
    speed: '速度',
    loopCount: 'ループ回数',
    loopCountTimes: '回',
    unlimited: '無制限',
    abLoop: 'A/Bループ',
    setStart: '開始点',
    setEnd: '終了点',
    clearLoop: 'クリア',
    addToPlaylistLabel: 'プレイリストに追加：',
    selectPlaylist: 'プレイリストを選択…',
    createNewPlaylist: '＋ 新しいプレイリストを作成',

    // Search
    searchPlaceholder: 'YouTubeで検索またはリンクを貼り付け…',
    searching: '検索中…',

    // Help tips
    tipAddPlaylist: '動画の再生中に、コントロール下の「プレイリストに追加」から追加できます。',
    tipOpenPlaylist: 'サイドバーのプレイリストをクリックして曲を表示します。曲をクリックして再生します。',

    // History
    clearHistory: '履歴を消去',
    noHistory: '履歴がありません',

    // Playlist loop
    loopPlaylist: 'プレイリストをループ',
    loopSong: '曲をループ',
    playingFrom: '再生元',

    // Playlist management
    deletePlaylist: 'プレイリストを削除',
    deletePlaylistConfirm: 'このプレイリストを削除しますか？',
    renameSong: '名前を変更',

    // Sharing
    share: '共有',
    shareManagePublic: '公開リンクを管理',
    shareSignInPrompt: 'プレイリストを公開で共有するにはサインインしてください。',
    shareIntro: 'このプレイリストを公開して誰でも共有できます — ループポイントも含まれます。',
    shareNeedsVideos: '先に動画を追加してください',
    makePublic: '公開する',
    sharePublicNow: '公開中 — リンクを知っている人なら誰でも再生できます',
    copyLink: 'リンクをコピー',
    republish: '再公開',
    unpublish: '非公開にする',

    // Channel search
    searchSongs: '曲',
    searchChannels: 'チャンネル',
    browseChannel: '動画を見る',
    sortNewest: '最新',
    sortPopular: '人気',
    sortOldest: '古い順',
  },

  fr: {
    // Settings dropdown
    settings: 'Paramètres',
    logIn: 'Connexion',
    signOut: 'Déconnexion',
    manageData: 'Gérer les données',
    helpShortcuts: 'Aide & raccourcis',
    featureRequests: 'Demandes de fonctionnalités',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    language: 'Langue',

    // Auth
    signIn: 'Se connecter',
    register: "S'inscrire",
    createAccount: 'Créer un compte',
    continueWithGoogle: 'Continuer avec Google',
    email: 'E-mail',
    passwordMin: 'Mot de passe (min 6 caractères)',
    or: 'ou',

    // Data dialog
    manageDataTitle: 'Gérer les données',
    exportDesc: 'Exportez vos playlists, dossiers et historique en fichier JSON.',
    exportBackup: 'Exporter la sauvegarde',
    importDesc: 'Restaurez depuis un fichier de sauvegarde précédemment exporté.',
    importBackup: 'Importer la sauvegarde',

    // Sidebar tabs
    playlists: 'Playlists',
    history: 'Historique',

    // Playlist actions
    newPlaylist: 'Nouvelle playlist',
    import: 'Importer',
    newFolder: 'Nouveau dossier',
    newPlaylistTitle: 'Nouvelle playlist',
    newFolderTitle: 'Nouveau dossier',
    playlistNamePlaceholder: 'Nom de la playlist…',
    folderNamePlaceholder: 'Nom du dossier…',
    create: 'Créer',
    back: 'Retour',
    shuffle: 'Aléatoire',
    emptyFolder: 'Dossier vide',
    noPlaylists: 'Aucune playlist',
    noSongsYet: "Aucune chanson. Ajoutez une vidéo à cette playlist pendant qu'elle est en lecture.",
    folder: 'Dossier :',
    noFolder: 'Aucun dossier',
    addToPlaylist: 'Ajouter à la playlist',
    noPlaylistsYet: 'Aucune playlist. Créez-en une.',

    // Import dialog
    importPlaylistTitle: 'Importer une playlist YouTube',
    importPlaceholder: 'https://youtube.com/playlist?list=PL...',
    importInvalidUrl: 'URL invalide. Collez un lien de playlist YouTube.',
    importFailed: "Échec de l'importation",
    importNetworkError: 'Erreur réseau. Réessayez.',
    importedOn: 'Importé le',

    // Controls
    volume: 'Volume',
    speed: 'Vitesse',
    loopCount: 'Répétitions',
    loopCountTimes: 'fois',
    unlimited: 'Illimité',
    abLoop: 'Boucle A/B',
    setStart: 'Définir début',
    setEnd: 'Définir fin',
    clearLoop: 'Effacer',
    addToPlaylistLabel: 'Ajouter à la playlist :',
    selectPlaylist: 'Sélectionner une playlist…',
    createNewPlaylist: '+ Créer une nouvelle playlist',

    // Search
    searchPlaceholder: 'Rechercher sur YouTube ou coller un lien…',
    searching: 'Recherche…',

    // Help tips
    tipAddPlaylist: 'Pendant la lecture, utilisez le menu déroulant « Ajouter à la playlist » sous les contrôles.',
    tipOpenPlaylist: 'Cliquez sur une playlist dans la barre latérale pour voir ses chansons. Cliquez sur une chanson pour la lire.',

    // History
    clearHistory: "Effacer l'historique",
    noHistory: 'Aucun historique',

    // Playlist loop
    loopPlaylist: 'Boucler la playlist',
    loopSong: 'Boucler le titre',
    playingFrom: 'Lu depuis',

    // Playlist management
    deletePlaylist: 'Supprimer la playlist',
    deletePlaylistConfirm: 'Supprimer cette playlist ?',
    renameSong: 'Renommer',

    // Sharing
    share: 'Partager',
    shareManagePublic: 'Gérer le lien public',
    shareSignInPrompt: 'Connectez-vous pour partager vos playlists publiquement.',
    shareIntro: 'Rendez cette playlist publique pour la partager — vos points de boucle sont inclus.',
    shareNeedsVideos: 'Ajoutez d’abord une vidéo',
    makePublic: 'Rendre publique',
    sharePublicNow: 'Publique — toute personne ayant le lien peut la lire',
    copyLink: 'Copier le lien',
    republish: 'Republier',
    unpublish: 'Rendre privée',

    // Channel search
    searchSongs: 'Chansons',
    searchChannels: 'Chaînes',
    browseChannel: 'Parcourir les vidéos',
    sortNewest: 'Récentes',
    sortPopular: 'Populaires',
    sortOldest: 'Anciennes',
  },
} satisfies Record<Lang, Record<string, string>>

export type Translations = typeof translations.en
