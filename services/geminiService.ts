
import { GoogleGenAI } from "@google/genai";
import { MarineData, Region } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysisSummary = async (region: Region, data: MarineData): Promise<string> => {
  const prompt = `
    당신은 전문 해양 환경 데이터 분석가입니다. 다음 데이터를 바탕으로 선택된 해역에 대한 상세한 분석 보고서를 생성해주세요.
    보고서는 일반인도 이해하기 쉽게 작성하되, 전문적인 식견을 담아주세요. 잠재적 위험 요인이나 특이사항을 강조해주세요.
    결과는 마크다운 형식으로 제목, 개요, 상세 분석, 예측 및 권장 사항 섹션으로 나누어 작성해주세요.

    해역: ${region}

    데이터:
    - 평균 해수면 온도: ${data.temperature}°C
    - 평균 염분 농도: ${data.salinity} PSU
    - 클로로필-a 농도: ${data.chlorophyll} mg/m³
    - 평균 파고: ${data.waveHeight} m
    - 미세플라스틱 농도 지수: ${data.plasticConcentration} (0~1, 높을수록 심각)

    분석 보고서 시작:
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating analysis summary:", error);
    return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
