/**
 * 파일 시스템 유틸리티
 */
class FileSystem {
    constructor() {
        this.isNWJS = typeof nw !== 'undefined';
        this.fs = null;
        this.path = null;
        
        if (this.isNWJS) {
            this.fs = require('fs');
            this.path = require('path');
        }
    }
    
    // 파일 읽기
    async readFile(filePath, encoding = 'utf8') {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.readFile(filePath, encoding, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                });
            } else {
                const response = await fetch(filePath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.text();
            }
        } catch (error) {
            console.error(`파일 읽기 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // 파일 쓰기
    async writeFile(filePath, data, encoding = 'utf8') {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.writeFile(filePath, data, encoding, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                // 브라우저에서는 다운로드로 처리
                this.downloadFile(data, filePath);
                return Promise.resolve();
            }
        } catch (error) {
            console.error(`파일 쓰기 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // 파일 존재 여부 확인
    async exists(filePath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve) => {
                    this.fs.access(filePath, this.fs.constants.F_OK, (err) => {
                        resolve(!err);
                    });
                });
            } else {
                const response = await fetch(filePath, { method: 'HEAD' });
                return response.ok;
            }
        } catch (error) {
            return false;
        }
    }
    
    // 디렉토리 생성
    async mkdir(dirPath, recursive = true) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.mkdir(dirPath, { recursive }, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                console.warn('브라우저에서는 디렉토리 생성이 지원되지 않습니다.');
                return Promise.resolve();
            }
        } catch (error) {
            console.error(`디렉토리 생성 실패: ${dirPath}`, error);
            throw error;
        }
    }
    
    // 디렉토리 목록 조회
    async readdir(dirPath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.readdir(dirPath, (err, files) => {
                        if (err) reject(err);
                        else resolve(files);
                    });
                });
            } else {
                console.warn('브라우저에서는 디렉토리 목록 조회가 지원되지 않습니다.');
                return [];
            }
        } catch (error) {
            console.error(`디렉토리 목록 조회 실패: ${dirPath}`, error);
            return [];
        }
    }
    
    // 파일 삭제
    async unlink(filePath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.unlink(filePath, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                console.warn('브라우저에서는 파일 삭제가 지원되지 않습니다.');
                return Promise.resolve();
            }
        } catch (error) {
            console.error(`파일 삭제 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // 파일 복사
    async copyFile(srcPath, destPath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.copyFile(srcPath, destPath, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                console.warn('브라우저에서는 파일 복사가 지원되지 않습니다.');
                return Promise.resolve();
            }
        } catch (error) {
            console.error(`파일 복사 실패: ${srcPath} -> ${destPath}`, error);
            throw error;
        }
    }
    
    // 파일 이동/이름 변경
    async rename(oldPath, newPath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.rename(oldPath, newPath, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
            } else {
                console.warn('브라우저에서는 파일 이동이 지원되지 않습니다.');
                return Promise.resolve();
            }
        } catch (error) {
            console.error(`파일 이동 실패: ${oldPath} -> ${newPath}`, error);
            throw error;
        }
    }
    
    // 파일 통계 조회
    async stat(filePath) {
        try {
            if (this.isNWJS) {
                return new Promise((resolve, reject) => {
                    this.fs.stat(filePath, (err, stats) => {
                        if (err) reject(err);
                        else resolve(stats);
                    });
                });
            } else {
                // 브라우저에서는 fetch로 파일 크기만 확인 가능
                const response = await fetch(filePath, { method: 'HEAD' });
                if (response.ok) {
                    const contentLength = response.headers.get('content-length');
                    return {
                        size: contentLength ? parseInt(contentLength) : 0,
                        isFile: true,
                        isDirectory: false,
                        mtime: new Date()
                    };
                }
                throw new Error('파일을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error(`파일 통계 조회 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // 경로 조인
    join(...paths) {
        if (this.isNWJS && this.path) {
            return this.path.join(...paths);
        } else {
            return paths.join('/').replace(/\/+/g, '/');
        }
    }
    
    // 경로 분리
    dirname(filePath) {
        if (this.isNWJS && this.path) {
            return this.path.dirname(filePath);
        } else {
            const lastSlash = filePath.lastIndexOf('/');
            return lastSlash !== -1 ? filePath.substring(0, lastSlash) : '.';
        }
    }
    
    // 파일명 추출
    basename(filePath, ext = '') {
        if (this.isNWJS && this.path) {
            return this.path.basename(filePath, ext);
        } else {
            const lastSlash = filePath.lastIndexOf('/');
            const filename = lastSlash !== -1 ? filePath.substring(lastSlash + 1) : filePath;
            if (ext && filename.endsWith(ext)) {
                return filename.substring(0, filename.length - ext.length);
            }
            return filename;
        }
    }
    
    // 확장자 추출
    extname(filePath) {
        if (this.isNWJS && this.path) {
            return this.path.extname(filePath);
        } else {
            const lastDot = filePath.lastIndexOf('.');
            const lastSlash = filePath.lastIndexOf('/');
            if (lastDot !== -1 && lastDot > lastSlash) {
                return filePath.substring(lastDot);
            }
            return '';
        }
    }
    
    // 절대 경로 변환
    resolve(...paths) {
        if (this.isNWJS && this.path) {
            return this.path.resolve(...paths);
        } else {
            // 브라우저에서는 상대 경로 처리
            const baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
            return baseUrl + '/' + this.join(...paths);
        }
    }
    
    // 파일 다운로드 (브라우저용)
    downloadFile(data, filename) {
        const blob = new Blob([data], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // JSON 파일 읽기
    async readJSON(filePath) {
        try {
            const content = await this.readFile(filePath);
            return JSON.parse(content);
        } catch (error) {
            console.error(`JSON 파일 읽기 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // JSON 파일 쓰기
    async writeJSON(filePath, data, pretty = true) {
        try {
            const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
            await this.writeFile(filePath, content);
        } catch (error) {
            console.error(`JSON 파일 쓰기 실패: ${filePath}`, error);
            throw error;
        }
    }
    
    // 설정 파일 로드
    async loadConfig(configPath = 'config.json') {
        try {
            const config = await this.readJSON(configPath);
            return config;
        } catch (error) {
            console.warn('설정 파일을 찾을 수 없습니다. 기본 설정을 사용합니다.');
            return this.getDefaultConfig();
        }
    }
    
    // 기본 설정
    getDefaultConfig() {
        return {
            game: {
                title: 'HAPPY SAINT SHEOL',
                version: '1.0.5',
                author: 'Unknown'
            },
            settings: {
                textSpeed: 5,
                autoDelay: 3000,
                bgmVolume: 50,
                sfxVolume: 50,
                voiceVolume: 50
            },
            paths: {
                scenes: 'data/scenes/',
                characters: 'images/characters/',
                backgrounds: 'images/backgrounds/',
                sounds: 'sounds/',
                saves: 'saves/'
            }
        };
    }
    
    // 설정 파일 저장
    async saveConfig(config, configPath = 'config.json') {
        try {
            await this.writeJSON(configPath, config);
        } catch (error) {
            console.error('설정 파일 저장 실패:', error);
            throw error;
        }
    }
}

// 전역 인스턴스
window.FileSystem = new FileSystem();
