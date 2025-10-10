/**
 * 메인 게임 파일
 */
class Game {
    constructor() {
        this.visualNovel = null;
        this.gameState = null;
        this.saveSystem = null;
        this.dialogueSystem = null;
        this.soundEngine = null;
        
        this.isInitialized = false;
        this.currentSceneData = null;
        
        this.initializeGame();
    }
    
    // 게임 초기화
    async initializeGame() {
        try {
            console.log('게임 초기화 시작...');
            
            // 시스템 초기화
            this.visualNovel = new VisualNovel();
            this.gameState = window.GameState;
            this.saveSystem = window.SaveSystem;
            this.dialogueSystem = window.DialogueSystem;
            this.soundEngine = window.SoundEngine;
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 설정 로드
            this.loadSettings();
            
            // 샘플 씬 데이터 로드
            this.loadSampleSceneData();
            
            // 사운드 프리로드
            await this.preloadSounds();
            
            this.isInitialized = true;
            console.log('게임 초기화 완료');
            
        } catch (error) {
            console.error('게임 초기화 실패:', error);
        }
    }
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 대화 완료 이벤트
        document.addEventListener('dialogueComplete', (event) => {
            this.onDialogueComplete(event.detail.dialogue);
        });
        
        // 선택지 선택 이벤트
        document.addEventListener('choiceSelected', (event) => {
            this.onChoiceSelected(event.detail);
        });
        
        // 설정 변경 이벤트
        document.addEventListener('settingsChanged', (event) => {
            this.onSettingsChanged(event.detail);
        });
        
        // 모달 닫기 이벤트
        const closeModal = document.getElementById('close-modal');
        const closeSettings = document.getElementById('close-settings');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.visualNovel.hideAllModals();
            });
        }
        
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.visualNovel.hideAllModals();
            });
        }
        
        // 설정 슬라이더 이벤트
        const textSpeedSlider = document.getElementById('text-speed');
        const bgmVolumeSlider = document.getElementById('bgm-volume');
        const sfxVolumeSlider = document.getElementById('sfx-volume');
        const voiceVolumeSlider = document.getElementById('voice-volume');
        
        if (textSpeedSlider) {
            textSpeedSlider.addEventListener('input', (e) => {
                this.visualNovel.textSpeed = parseInt(e.target.value);
                this.visualNovel.saveSettings();
            });
        }
        
        if (bgmVolumeSlider) {
            bgmVolumeSlider.addEventListener('input', (e) => {
                this.soundEngine.setVolume('bgm', parseInt(e.target.value) / 100);
                this.visualNovel.saveSettings();
            });
        }
        
        if (sfxVolumeSlider) {
            sfxVolumeSlider.addEventListener('input', (e) => {
                this.soundEngine.setVolume('sfx', parseInt(e.target.value) / 100);
                this.visualNovel.saveSettings();
            });
        }
        
        if (voiceVolumeSlider) {
            voiceVolumeSlider.addEventListener('input', (e) => {
                this.soundEngine.setVolume('voice', parseInt(e.target.value) / 100);
                this.visualNovel.saveSettings();
            });
        }
    }
    
    // 설정 로드
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('vnSettings') || '{}');
        
        // 비주얼 노벨 설정 적용
        if (settings.textSpeed) {
            this.visualNovel.textSpeed = settings.textSpeed;
        }
        if (settings.autoDelay) {
            this.visualNovel.autoDelay = settings.autoDelay;
        }
        
        // 사운드 설정 적용
        if (settings.bgmVolume !== undefined) {
            this.soundEngine.setVolume('bgm', settings.bgmVolume / 100);
        }
        if (settings.sfxVolume !== undefined) {
            this.soundEngine.setVolume('sfx', settings.sfxVolume / 100);
        }
        if (settings.voiceVolume !== undefined) {
            this.soundEngine.setVolume('voice', settings.voiceVolume / 100);
        }
    }
    
    // 샘플 씬 데이터 로드
    loadSampleSceneData() {
        this.currentSceneData = {
            id: 'intro',
            name: '시작',
            dialogues: [
                {
                    characterName: '나레이션',
                    text: '어느 날, 평범한 아침이었습니다.',
                    background: 'images/backgrounds/morning.jpg',
                    textEffect: 'fade'
                },
                {
                    characterName: '나레이션',
                    text: '하지만 이 아침은 다른 아침들과 달랐습니다.',
                    textEffect: 'typewriter'
                },
                {
                    characterName: '주인공',
                    text: '오늘은 뭔가 다른 기분이야...',
                    character: 'images/characters/protagonist.png',
                    characterPosition: 'center',
                    textEffect: 'slide'
                },
                {
                    characterName: '나레이션',
                    text: '그때 갑자기 문이 열리며 누군가가 들어왔습니다.',
                    textEffect: 'fade'
                },
                {
                    characterName: '미스터리한 인물',
                    text: '안녕하세요! 저는 당신의 새로운 모험을 도와드리러 왔습니다.',
                    character: 'images/characters/mystery.png',
                    characterPosition: 'right',
                    textEffect: 'bounce',
                    choices: [
                        {
                            text: '누구세요?',
                            nextDialogue: 5
                        },
                        {
                            text: '어떤 모험인가요?',
                            nextDialogue: 6
                        },
                        {
                            text: '...',
                            nextDialogue: 7
                        }
                    ]
                },
                {
                    characterName: '미스터리한 인물',
                    text: '아, 제 소개를 드리지 않았네요. 저는 마카롱입니다!',
                    character: 'images/characters/mystery.png',
                    characterPosition: 'right',
                    textEffect: 'typewriter'
                },
                {
                    characterName: '미스터리한 인물',
                    text: '당신이 꿈꾸던 그 모험 말이에요! 신비로운 세계로의 여행이죠.',
                    character: 'images/characters/mystery.png',
                    characterPosition: 'right',
                    textEffect: 'slide'
                },
                {
                    characterName: '주인공',
                    text: '...정말 이상한 사람이네요.',
                    character: 'images/characters/protagonist.png',
                    characterPosition: 'center',
                    textEffect: 'fade'
                },
                {
                    characterName: '미스터리한 인물',
                    text: '하하하! 그럼 이제 시작해볼까요?',
                    character: 'images/characters/mystery.png',
                    characterPosition: 'right',
                    textEffect: 'bounce',
                    sound: {
                        type: 'sfx',
                        file: 'sounds/magic.mp3',
                        volume: 0.8
                    }
                },
                {
                    characterName: '나레이션',
                    text: '그렇게 주인공의 새로운 모험이 시작되었습니다...',
                    background: 'images/backgrounds/adventure.jpg',
                    textEffect: 'fade'
                }
            ]
        };
    }
    
    // 사운드 프리로드
    async preloadSounds() {
        const soundList = [
            { name: 'bgm_main', url: 'sounds/bgm/main_theme.mp3', type: 'bgm' },
            { name: 'sfx_click', url: 'sounds/sfx/click.mp3', type: 'sfx' },
            { name: 'sfx_magic', url: 'sounds/sfx/magic.mp3', type: 'sfx' },
            { name: 'voice_protagonist', url: 'sounds/voice/protagonist.mp3', type: 'voice' }
        ];
        
        try {
            await this.soundEngine.preloadSounds(soundList);
            console.log('사운드 프리로드 완료');
        } catch (error) {
            console.warn('사운드 프리로드 실패:', error);
        }
    }
    
    // 게임 시작 (메인 메뉴에서 호출)
    startGame() {
        if (!this.isInitialized) {
            console.error('게임이 초기화되지 않았습니다.');
            return;
        }
        
        console.log('게임 시작');
        
        // 메인 BGM 재생
        this.soundEngine.playBGM('bgm_main');
        
        // 첫 번째 씬 시작
        this.visualNovel.startScene(this.currentSceneData);
    }
    
    // 대화 완료 처리
    onDialogueComplete(dialogue) {
        console.log('대화 완료:', dialogue);
        
        // 게임 상태 업데이트
        this.gameState.setFlag('last_dialogue_completed', true);
        this.gameState.incrementVariable('dialogue_count');
        
        // 특별한 대화 처리
        if (dialogue.characterName === '미스터리한 인물' && dialogue.text.includes('마카롱')) {
            this.gameState.setFlag('met_mystery_character', true);
            this.gameState.addAchievement({
                id: 'first_meeting',
                name: '첫 만남',
                description: '미스터리한 인물과 만났습니다.'
            });
        }
    }
    
    // 선택지 선택 처리
    onChoiceSelected(detail) {
        console.log('선택지 선택:', detail);
        
        // 선택 기록
        this.gameState.recordChoice(
            this.currentSceneData.id,
            detail.choiceIndex,
            detail.choice.text
        );
        
        // 선택에 따른 플래그 설정
        if (detail.choice.text.includes('누구세요?')) {
            this.gameState.setFlag('asked_who', true);
        } else if (detail.choice.text.includes('어떤 모험')) {
            this.gameState.setFlag('asked_adventure', true);
        }
        
        // 다음 대화로 진행
        this.visualNovel.nextDialogue();
    }
    
    // 설정 변경 처리
    onSettingsChanged(settings) {
        console.log('설정 변경:', settings);
        
        // 설정 저장
        this.visualNovel.saveSettings();
    }
    
    // 씬 변경
    changeScene(sceneId) {
        console.log(`씬 변경: ${sceneId}`);
        
        // 씬 데이터 로드 (실제 구현에서는 서버에서 로드)
        this.loadSceneData(sceneId);
        
        // 게임 상태 업데이트
        this.gameState.setScene(sceneId);
        
        // 새 씬 시작
        if (this.currentSceneData) {
            this.visualNovel.startScene(this.currentSceneData);
        }
    }
    
    // 씬 데이터 로드
    loadSceneData(sceneId) {
        // 실제 구현에서는 서버에서 씬 데이터를 가져옴
        // 여기서는 샘플 데이터 사용
        this.currentSceneData = {
            id: sceneId,
            name: `씬 ${sceneId}`,
            dialogues: [
                {
                    characterName: '나레이션',
                    text: `새로운 씬 ${sceneId}에 도착했습니다.`,
                    textEffect: 'fade'
                }
            ]
        };
    }
    
    // 게임 일시정지
    pauseGame() {
        console.log('게임 일시정지');
        this.soundEngine.stopBGM();
    }
    
    // 게임 재개
    resumeGame() {
        console.log('게임 재개');
        this.soundEngine.playBGM('bgm_main');
    }
    
    // 게임 종료
    endGame() {
        console.log('게임 종료');
        
        // 자동 저장
        this.saveSystem.autoSave();
        
        // 모든 사운드 정지
        this.soundEngine.stopAllSounds();
        
        // 게임 상태 저장
        this.gameState.setFlag('game_ended', true);
    }
    
    // 게임 통계 조회
    getGameStats() {
        return {
            playTime: this.gameState.getFormattedPlayTime(),
            dialogueCount: this.gameState.getVariable('dialogue_count'),
            visitedScenes: this.gameState.visitedScenes.size,
            achievements: this.gameState.getAchievements().length,
            dialogueStats: this.dialogueSystem.getDialogueStats()
        };
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    window.Game = new Game();
});

// 페이지 언로드 시 게임 종료
window.addEventListener('beforeunload', () => {
    if (window.Game) {
        window.Game.endGame();
    }
});
