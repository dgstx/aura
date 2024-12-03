import { useTheme } from "@material-ui/core/styles";
import TextField from '@material-ui/core/TextField';
import React, { useEffect, useState } from "react";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import CustomTooltip from "./CustomTooltip";
import Title from "./Title";

const ChartPerConnection = ({ searchParam, pageNumber, status, date, showAll, queueIds, withUnreadMessages }) => {
    const theme = useTheme();

    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const { tickets } = useTickets({
        searchParam,
        pageNumber,
        status,
        date: selectedDate,
        showAll,
        queueIds,
        withUnreadMessages,
    });

    const [connectionChartData, setConnectionChartData] = useState([]);

    useEffect(() => {
        const connectionData = tickets.reduce((acc, ticket) => {
            const connectionName = ticket.whatsapp?.name || "Sem Conexão";
            const connectionColor = ticket.whatsapp?.color || "#5C59A0";

            if (!acc[connectionName]) {
                acc[connectionName] = { value: 0, color: connectionColor };
            }
            acc[connectionName].value++;

            return acc;
        }, {});

        const formattedData = Object.entries(connectionData).map(([name, { value, color }]) => ({
            name,
            value,
            color,
        }));

        setConnectionChartData(formattedData);
    }, [tickets]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const filteredChartData = connectionChartData.filter(data => data.value > 0);

    return (
        <React.Fragment>
            <Title>{i18n.t("dashboard.chartPerConnection.perConnection.title")}</Title>
            <TextField
                label={i18n.t("dashboard.chartPerConnection.date.title")}
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                InputLabelProps={{
                    shrink: true,
                }}
                style={{ marginBottom: "16px" }}
            />
            <ResponsiveContainer width="95%" height={265}>
                <PieChart>
                    <Pie
                        data={filteredChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="40%"
                        cy="50%"
                        outerRadius={80}
                        fill={theme.palette.primary.main}
                        label
                    >
                        {filteredChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={true} />
                    {filteredChartData.length > 0 && (
                        <Legend verticalAlign="middle" align="right" layout="vertical" />
                    )}
                </PieChart>
            </ResponsiveContainer>
        </React.Fragment>
    );
};

export default ChartPerConnection;