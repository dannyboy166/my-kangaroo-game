export default class AudioManager {
    constructor() {
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.sounds = {};
        this.currentMusic = null;
        this.currentMusicKey = null; // Track which music is playing
        this.currentMusicVolume = 0.3; // Track volume for resume
        this.scene = null;

        // Throttling for frequently played sounds
        this.lastPlayTimes = {
            jump: 0,
            land: 0,
            coin: 0
        };
        this.minDelays = {
            jump: 80,
            land: 100,
            coin: 40
        };
    }
    
    init(scene) {
        this.scene = scene;
    }

    preloadSounds(scene) {
        // This will be called from each scene's preload
    }
    
    setSounds(sounds) {
        this.sounds = sounds;
    }
    
    playSound(key, volume = 1.0) {
        if (!this.soundEnabled || !this.sounds[key]) return;
        
        try {
            this.sounds[key].play({ volume });
        } catch (e) {
            console.warn(`Failed to play sound: ${key}`, e);
        }
    }
    
    playThrottledSound(key, volume = 1.0) {
        const now = Date.now();
        const lastTime = this.lastPlayTimes[key] || 0;
        const minDelay = this.minDelays[key] || 50;
        
        if (now - lastTime > minDelay) {
            this.lastPlayTimes[key] = now;
            this.playSound(key, volume);
        }
    }
    
    playJump() {
        this.playThrottledSound('jump', 0.7);
    }
    
    playLand() {
        this.playThrottledSound('land', 0.6);
    }
    
    playCoinCollect() {
        this.playThrottledSound('coin_collect', 0.9);
    }
    
    playCollision() {
        this.playSound('collision', 0.8);
    }
    
    playGameOver() {
        this.playSound('game_over', 1.0);
    }
    
    playDoubleJump() {
        this.playSound('double_jump', 0.8);
    }
    
    playShieldActivate() {
        this.playSound('shield_activate', 0.8);
    }
    
    playMagnetActivate() {
        this.playSound('magnet_activate', 0.8);
    }
    
    playButtonClick() {
        this.playSound('button_click', 0.6);
    }
    
    playMusic(key, volume = 0.4, loop = true) {
        if (!this.musicEnabled || !this.sounds[key]) return;

        // If the same music is already playing, don't restart it
        if (this.currentMusic === this.sounds[key] && this.currentMusic.isPlaying) {
            return;
        }

        this.stopMusic();

        try {
            // Store the sound object itself, not the return value of play()
            this.currentMusic = this.sounds[key];
            this.currentMusicKey = key; // Remember what's playing
            this.currentMusicVolume = volume; // Remember volume
            this.currentMusic.play({ volume, loop });
        } catch (e) {
            console.warn(`Failed to play music: ${key}`, e);
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            // Check if sound is playing before stopping
            if (this.currentMusic.isPlaying) {
                this.currentMusic.stop();
            }
            this.currentMusic = null;
            // Don't clear currentMusicKey - we need it to resume
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        return this.soundEnabled;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (!this.musicEnabled) {
            // Turning music OFF - stop current music
            this.stopMusic();
        } else {
            // Turning music ON - resume last music if we have one
            if (this.currentMusicKey && this.sounds[this.currentMusicKey]) {
                this.playMusic(this.currentMusicKey, this.currentMusicVolume, true);
            }
        }

        return this.musicEnabled;
    }
}