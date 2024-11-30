import React from "react";
import { Avatar, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
    avatar: {
        width: "55px",
        height: "55px",
        borderRadius: "25%",
    },
    cardHeader: {
        cursor: "pointer",
    },
    title: {
        fontWeight: "bold",
        fontSize: "1.2rem",
    },
    subheader: {
        display: "flex",
        alignItems: "center",
    },
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
    const classes = useStyles();
    return (
        <CardHeader
            onClick={onClick}
            className={classes.cardHeader}
            titleTypographyProps={{
                noWrap: true,
                className: classes.title,
            }}
            subheaderTypographyProps={{ noWrap: true }}
            avatar={<Avatar src={contact.profilePicUrl} className={classes.avatar} alt="contact_image" />}
            title={contact.name}
            subheader={
                <div className={classes.subheader}>
                    {`Ticket: #${ticket.id} | `}
                    {ticket.user && (
                        <>
                            {`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`}
                            {ticket.queue ? ` | Setor: ${ticket.queue.name}` : " | Setor: Nenhum"}
                        </>
                    )}
                </div>
            }
        />
    );
};

export default TicketInfo;