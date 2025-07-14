import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import styled from "styled-components";

const StyledTooltip = styled.div`
  background-color: #fff;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const StyledTooltipText = styled.p`
  margin: 0;
  font-weight: bold;
  color: #1e1e1e;
`;

const StyledTooltipMain = styled.h2`
  margin: 0;
  font-weight: bold;
  color: #000000;
`;

const NoDataContainer = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #666;
`;

const TooltipContent = ({ active, payload, dataKey }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data) return null;

    return (
        <StyledTooltip>
            {dataKey === "attendancePercentage" ? (
                <>
                    <StyledTooltipMain>{data.subject}</StyledTooltipMain>
                    <StyledTooltipText>
                        Attended: ({data.attendedClasses || 0}/{data.totalClasses || 0})
                    </StyledTooltipText>
                    <StyledTooltipText>{data.attendancePercentage || 0}%</StyledTooltipText>
                </>
            ) : (
                <>
                    <StyledTooltipMain>
                        {data.subName?.subName || "Subject"}
                    </StyledTooltipMain>
                    <StyledTooltipText>Marks: {data.marksObtained || 0}</StyledTooltipText>
                </>
            )}
        </StyledTooltip>
    );
};

const CustomBarChart = ({ chartData = [], dataKey = "value" }) => {
    // Return early if no data
    if (!chartData || !chartData.length) {
        return (
            <NoDataContainer>
                No data available to display
            </NoDataContainer>
        );
    }

    const subjects = chartData.map((data) => data.subject || data.subName?.subName || "");
    const distinctColors = generateDistinctColors(Math.max(subjects.length, 1));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                    dataKey={dataKey === "marksObtained" ? "subName.subName" : "subject"}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<TooltipContent dataKey={dataKey} />} />
                <Bar dataKey={dataKey}>
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={distinctColors[index % distinctColors.length]}
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

// Helper function to generate distinct colors
const generateDistinctColors = (count) => {
    const colors = [];
    const goldenRatioConjugate = 0.618033988749895;

    for (let i = 0; i < count; i++) {
        const hue = (i * goldenRatioConjugate) % 1;
        const color = hslToRgb(hue, 0.6, 0.6);
        colors.push(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    }

    return colors;
};

// Helper function to convert HSL to RGB
const hslToRgb = (h, s, l) => {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // Achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export default CustomBarChart;
