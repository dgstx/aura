import React, { useContext, useEffect, useRef, useState } from "react";
import { MenuItem, Menu, makeStyles } from "@material-ui/core";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";
import TransferTicketModal from "../TransferTicketModal";
import toastError from "../../errors/toastError";
import { Can } from "../Can";
import { AuthContext } from "../../context/Auth/AuthContext";

const useStyles = makeStyles((theme) => ({
    menu: {
        borderRadius: 13,
    },
}));

const TicketOptionsMenu = ({ ticket, menuOpen, handleClose, anchorEl }) => {
    const classes = useStyles();
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
    const isMounted = useRef(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleDeleteTicket = async () => {
        try {
            await api.delete(`/tickets/${ticket.id}`);
        } catch (err) {
            toastError(err);
        }
    };

    const handleOpenConfirmationModal = (e) => {
        setConfirmationOpen(true);
        handleClose();
    };

    const handleOpenTransferModal = (e) => {
        setTransferTicketModalOpen(true);
        handleClose();
    };

    const handleCloseTransferTicketModal = () => {
        if (isMounted.current) {
            setTransferTicketModalOpen(false);
        }
    };

    return (
        <>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                open={menuOpen}
                onClose={handleClose}
                classes={{ paper: classes.menu }}
            >
                <MenuItem onClick={handleOpenTransferModal}>
                    {i18n.t("ticketOptionsMenu.transfer")}
                </MenuItem>
                <Can
                    role={user.profile}
                    perform="ticket-options:deleteTicket"
                    yes={() => (
                        <MenuItem onClick={handleOpenConfirmationModal}>
                            {i18n.t("ticketOptionsMenu.delete")}
                        </MenuItem>
                    )}
                />
            </Menu>
            <ConfirmationModal
                title={`${i18n.t("ticketOptionsMenu.confirmationModal.title")}${ticket.id} ${i18n.t("ticketOptionsMenu.confirmationModal.titleFrom")} ${ticket.contact.name}?`}
                open={confirmationOpen}
                onClose={setConfirmationOpen}
                onConfirm={handleDeleteTicket}
            >
                {i18n.t("ticketOptionsMenu.confirmationModal.message")}
            </ConfirmationModal>
            <TransferTicketModal
                modalOpen={transferTicketModalOpen}
                onClose={handleCloseTransferTicketModal}
                ticketid={ticket.id}
            />
        </>
    );
};

export default TicketOptionsMenu;