/**
 * 사운드 엔진
 */
class SoundEngine {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();
        this.currentBGM = null;
        this.volumes = {
            master: 1.0,
            bgm: 0.5,
            sfx: 0.7,
            voice: 0.8
        };
        
        this.initializeAudioContext();
        this.loadSettings();
    }
    
    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API를 지원하지 않는 브라우저입니다.');
        }
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('vnSettings') || '{}');
        this.volumes.bgm = (settings.bgmVolume || 50) / 100;
        this.volumes.sfx = (settings.sfxVolume || 50) / 100;
        this.volumes.voice = (settings.voiceVolume || 50) / 100;
    }
    
    // 오디오 파일 로드
    async loadSound(name, url, type = 'sfx') {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.sounds.set(name, {
                buffer: audioBuffer,
                type: type
            });
            
            return true;
        } catch (error) {
            console.error(`사운드 로드 실패: ${name}`, error);
            return false;
        }
    }
    
    // BGM 재생
    playBGM(name, loop = true, fadeIn = true) {
        if (this.currentBGM) {
            this.stopBGM();
        }
        
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`BGM을 찾을 수 없습니다: ${name}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = sound.buffer;
        source.loop = loop;
        
        gainNode.gain.value = fadeIn ? 0 : this.volumes.bgm * this.volumes.master;
        gainNode.connect(this.audioContext.destination);
        source.connect(gainNode);
        
        source.start(0);
        
        this.currentBGM = {
            source: source,
            gainNode: gainNode,
            name: name
        };
        
        if (fadeIn) {
            this.fadeInBGM();
        }
    }
    
    // BGM 정지
    stopBGM(fadeOut = true) {
        if (!this.currentBGM) return;
        
        if (fadeOut) {
            this.fadeOutBGM();
        } else {
            this.currentBGM.source.stop();
            this.currentBGM = null;
        }
    }
    
    // BGM 페이드 인
    fadeInBGM(duration = 2000) {
        if (!this.currentBGM) return;
        
        const gainNode = this.currentBGM.gainNode;
        const targetVolume = this.volumes.bgm * this.volumes.master;
        const startTime = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(targetVolume, startTime + duration / 1000);
    }
    
    // BGM 페이드 아웃
    fadeOutBGM(duration = 1000) {
        if (!this.currentBGM) return;
        
        const gainNode = this.currentBGM.gainNode;
        const startTime = this.audioContext.currentTime;
        
        gainNode.gain.setValueAtTime(this.volumes.bgm * this.volumes.master, startTime);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);
        
        setTimeout(() => {
            if (this.currentBGM) {
                this.currentBGM.source.stop();
                this.currentBGM = null;
            }
        }, duration);
    }
    
    // 효과음 재생
    playSFX(name, volume = 1.0) {
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`효과음을 찾을 수 없습니다: ${name}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = sound.buffer;
        gainNode.gain.value = this.volumes.sfx * this.volumes.master * volume;
        
        gainNode.connect(this.audioContext.destination);
        source.connect(gainNode);
        
        source.start(0);
    }
    
    // 음성 재생
    playVoice(name, volume = 1.0) {
        const sound = this.sounds.get(name);
        if (!sound) {
            console.warn(`음성을 찾을 수 없습니다: ${name}`);
            return;
        }
        
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = sound.buffer;
        gainNode.gain.value = this.volumes.voice * this.volumes.master * volume;
        
        gainNode.connect(this.audioContext.destination);
        source.connect(gainNode);
        
        source.start(0);
    }
    
    // 볼륨 설정
    setVolume(type, volume) {
        if (this.volumes.hasOwnProperty(type)) {
            this.volumes[type] = Math.max(0, Math.min(1, volume));
            
            // 현재 재생 중인 BGM 볼륨 업데이트
            if (type === 'bgm' && this.currentBGM) {
                this.currentBGM.gainNode.gain.value = this.volumes.bgm * this.volumes.master;
            }
        }
    }
    
    // 마스터 볼륨 설정
    setMasterVolume(volume) {
        this.volumes.master = Math.max(0, Math.min(1, volume));
        
        // 모든 볼륨 재계산
        if (this.currentBGM) {
            this.currentBGM.gainNode.gain.value = this.volumes.bgm * this.volumes.master;
        }
    }
    
    // 모든 사운드 정지
    stopAllSounds() {
        if (this.currentBGM) {
            this.stopBGM(false);
        }
    }
    
    // 오디오 컨텍스트 재개 (사용자 상호작용 후)
    resumeAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    // 사운드 프리로드
    async preloadSounds(soundList) {
        const loadPromises = soundList.map(sound => 
            this.loadSound(sound.name, sound.url, sound.type)
        );
        
        const results = await Promise.all(loadPromises);
        const successCount = results.filter(r => r).length;
        
        console.log(`${successCount}/${soundList.length} 사운드가 성공적으로 로드되었습니다.`);
        return successCount === soundList.length;
    }
    
    // 사운드 캐시 정리
    clearCache() {
        this.sounds.clear();
        if (this.currentBGM) {
            this.stopBGM(false);
        }
    }
}

// 전역 인스턴스
window.SoundEngine = new SoundEngine();

// 사용자 상호작용 시 오디오 컨텍스트 재개
document.addEventListener('click', () => {
    window.SoundEngine.resumeAudioContext();
}, { once: true });

document.addEventListener('keydown', () => {
    window.SoundEngine.resumeAudioContext();
}, { once: true });
