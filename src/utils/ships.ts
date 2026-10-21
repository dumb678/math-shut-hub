import { SpaceshipModel } from '../types';

export const SPACESHIPS: SpaceshipModel[] = [
  {
    id: 'thunderbolt',
    name: '썬더볼트 (Thunderbolt)',
    color: '#38bdf8', // sky blue
    accentColor: '#0284c7',
    bulletColor: '#67e8f9',
    description: '균형 잡힌 초고속 플라즈마 레이저 함선'
  },
  {
    id: 'starfire',
    name: '스타파이어 (Starfire)',
    color: '#f43f5e', // rose red
    accentColor: '#be123c',
    bulletColor: '#fb7185',
    description: '강력한 화력과 열정의 붉은 혜성 기체'
  },
  {
    id: 'falcon',
    name: '골드 팔콘 (Gold Falcon)',
    color: '#fbbf24', // amber gold
    accentColor: '#d97706',
    bulletColor: '#fde047',
    description: '황금빛 럭셔리 실드와 정밀 조준 시스템'
  },
  {
    id: 'emerald',
    name: '에메랄드 아스트로 (Emerald)',
    color: '#34d399', // emerald green
    accentColor: '#059669',
    bulletColor: '#6ee7b7',
    description: '민첩한 기동성과 네온 에너지 펄스 기체'
  }
];

export function getShipById(id: string): SpaceshipModel {
  return SPACESHIPS.find(s => s.id === id) || SPACESHIPS[0];
}
