import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

const CustomBarChart = ({ data, XAxisKey = "subject", YAxisKey = "average", barKey = "average", tooltip = "Average %" }) => {
    if (!data || data.length === 0) {
        return <NoDataContainer>No data available for chart</NoDataContainer>;
    }

    // Ensure data is properly formatted
    const formattedData = data.map(item => ({
        [XAxisKey]: item[XAxisKey],
        [barKey]: typeof item[YAxisKey] === 'number' ? Number(item[YAxisKey].toFixed(1)) : 0
    }));

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart
                data={formattedData}
                margin={{
                    top: 20,
                    right: 30,
                    left: 30,
                    bottom: 60
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey={XAxisKey}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                />
                <YAxis
                    domain={[0, 100]}
                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                    formatter={(value) => [`${value}%`, tooltip]}
                    labelFormatter={(label) => `Subject: ${label}`}
                />
                <Bar
                    dataKey={barKey}
                    fill="#8884d8"
                    name={tooltip}
                    radius={[5, 5, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CustomBarChart;
