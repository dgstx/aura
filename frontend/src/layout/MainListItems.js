import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    makeStyles, 
    Typography, 
    Badge, 
    Divider,
    ListSubheader
} from "@material-ui/core";
import { 
    Dashboard as DashboardIcon,
    WhatsApp,
    ContactPhone,
    QuestionAnswer,
    LocalOffer,
    Sync,
    People,
    AccountTree,
    DeveloperMode,
    Settings,
    Code,
    MenuBook,
    VpnKey,
    SettingsEthernet
} from "@material-ui/icons";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { useLocation } from "react-router-dom"; // Adicione esta importação

const useStyles = makeStyles(theme => ({
    drawer: {
        width: 300,
        flexShrink: 0,
        overflowX: 'hidden',
    },
    drawerPaper: {
        width: 300,
        backgroundColor: theme.palette.background.default,
        borderRight: `1px solid ${theme.palette.divider}`,
        overflowX: 'hidden',
    },
    toolbar: {
        ...theme.mixins.toolbar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-left',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    listItem: {
        width: 'calc(100% - 16px)',
        margin: theme.spacing(0.5, 'auto'),
        borderRadius: 8,
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transform: 'scale(1.02)', // Animação centralizada
        },
    },
    
    listItemActive: {
        backgroundColor: theme.palette.action.selected,
        color: '#8c52ff', // Cor do texto quando ativo
        '& .MuiListItemIcon-root': {
            color: '#8c52ff', // Cor do ícone quando ativo
        },
        '&:hover': {
            backgroundColor: theme.palette.action.selected,
        },
    },
    icon: {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
    },
    subheader: {
        color: theme.palette.text.secondary,
        fontWeight: 400,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        whiteSpace: 'nowrap',  // Impede a quebra de linha
        overflow: 'hidden',    // Esconde o conteúdo que excede
        textOverflow: 'ellipsis', // Adiciona reticências se o texto for muito longo
    },
    divider: {
        margin: theme.spacing(1, 'auto'),
        width: 'calc(100% - 32px)',
    },    
}));

const MainListItems = ({ drawerClose }) => {
    const classes = useStyles();
    const { whatsApps } = useContext(WhatsAppsContext);
    const { user } = useContext(AuthContext);
    const location = useLocation(); // Hook para pegar a localização atual
    const [connectionWarning, setConnectionWarning] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const offlineWhats = whatsApps.filter(whats => 
                ['qrcode', 'PAIRING', 'DISCONNECTED', 'TIMEOUT', 'OPENING'].includes(whats.status)
            );
            setConnectionWarning(offlineWhats.length > 0);
        }, 2000);
        return () => clearTimeout(timer);
    }, [whatsApps]);

    const MenuItem = ({ to, icon, primary, href, warning }) => {
        // Verifica se o item atual está ativo comparando o caminho
        const isActive = location.pathname === to;

        const Icon = () => (
            warning ? (
                <Badge badgeContent="!" color="error" overlap="rectangular">
                    {icon}
                </Badge>
            ) : icon
        );

        const props = href 
            ? { component: "a", href, target: "_blank", rel: "noopener noreferrer" }
            : { component: RouterLink, to };

        return (
            <ListItem 
                button 
                {...props}
                className={`${classes.listItem} ${isActive ? classes.listItemActive : ''}`}
            >
                <ListItemIcon className={classes.icon}>
                    <Icon />
                </ListItemIcon>
                <ListItemText 
                    primary={
                        <Typography 
                            variant="body2" 
                            color={isActive ? "textPrimary" : "inherit"}
                            style={{ color: isActive ? '#8c52ff' : 'inherit' }}
                        >
                            {primary}
                        </Typography>
                    } 
                />
            </ListItem>
        );
    };

    return (
        <List>
            <MenuItem 
                to="/" 
                icon={<DashboardIcon />} 
                primary="Dashboard" 
            />
            <MenuItem 
                to="/tickets" 
                icon={<WhatsApp />} 
                primary={i18n.t("mainDrawer.listItems.tickets")} 
            />
            <MenuItem 
                to="/contacts" 
                icon={<ContactPhone />} 
                primary={i18n.t("mainDrawer.listItems.contacts")} 
            />
            <MenuItem 
                to="/quickAnswers" 
                icon={<QuestionAnswer />} 
                primary={i18n.t("mainDrawer.listItems.quickAnswers")} 
            />
            <MenuItem 
                to="/tags" 
                icon={<LocalOffer />} 
                primary={i18n.t("mainDrawer.listItems.tags")} 
            />

            <Can
                role={user.profile}
                perform="drawer-admin-items:view"
                yes={() => (
                    <>
                        <Divider className={classes.divider} />
                        <ListSubheader className={classes.subheader}>
                            {i18n.t("mainDrawer.listItems.administration")}
                        </ListSubheader>
                        <MenuItem 
                            to="/connections" 
                            icon={<SettingsEthernet />} 
                            primary={i18n.t("mainDrawer.listItems.connections")}
                            warning={connectionWarning}
                        />
                        <MenuItem 
                            to="/users" 
                            icon={<People />} 
                            primary={i18n.t("mainDrawer.listItems.users")} 
                        />
                        <MenuItem 
                            to="/queues" 
                            icon={<AccountTree />} 
                            primary={i18n.t("mainDrawer.listItems.queues")} 
                        />
                        <MenuItem 
                            to="/Integrations" 
                            icon={<DeveloperMode />} 
                            primary={i18n.t("mainDrawer.listItems.integrations")} 
                        />
                        <MenuItem 
                            to="/settings" 
                            icon={<Settings />} 
                            primary={i18n.t("mainDrawer.listItems.settings")} 
                        />

                        <Divider className={classes.divider} />
                        <ListSubheader className={classes.subheader}>
                            {i18n.t("mainDrawer.listItems.apititle")}
                        </ListSubheader>
                        <MenuItem 
                            to="/api" 
                            icon={<Code />} 
                            primary={i18n.t("mainDrawer.listItems.api")} 
                        />
                        <MenuItem 
                            href="https://docs.meuhub.com.br/categoria/wasap/" 
                            icon={<MenuBook />} 
                            primary={i18n.t("mainDrawer.listItems.apidocs")}
                            target="_blank"
                            rel="noopener noreferrer"
                        />
                        <MenuItem 
                            to="/apikey" 
                            icon={<VpnKey />} 
                            primary={i18n.t("mainDrawer.listItems.apikey")} 
                        />
                    </>
                )}
            />
        </List>
    );
};

export default MainListItems;