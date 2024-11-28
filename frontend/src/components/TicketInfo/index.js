import React from "react";

import { Avatar, CardHeader } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(() => ({
	avatar: {
		width: "55px",
		height: "55px",
		borderRadius: "13px"
	}
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	return (
		<CardHeader
			onClick={onClick}
			style={{ cursor: "pointer" }}
			titleTypographyProps={{
				noWrap: true,
				style: { fontWeight: "bold", color: "#000" } // Negrito e cor preta
			}}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar src={contact.profilePicUrl} className={classes.avatar} alt="contact_image" />}
			title={contact.name}
			subheader={
				`#${ticket.id} - ` + // Número do ticket como primeiro item
				(ticket.user &&
					`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name} 
					${ticket.queue ? ' | Setor: ' + ticket.queue.name : ' | Setor: Nenhum'}`)
			}
		/>
	);
};

export default TicketInfo;
