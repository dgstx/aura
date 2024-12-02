import { makeStyles } from "@material-ui/core/styles";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { CSVLink } from "react-csv";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import {
  Avatar,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  TextField,
} from "@material-ui/core";

import {
  AddCircleOutline,
  Archive,
  DeleteForever,
  DeleteOutline,
  Edit,
  ImportContacts,
  WhatsApp,
} from "@material-ui/icons";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import { Can } from "../../components/Can";
import ConfirmationModal from "../../components/ConfirmationModal/";
import ContactModal from "../../components/ContactModal";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import NewTicketModalPageContact from "../../components/NewTicketModalPageContact";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagsFilter from "../../components/TagsFilter";
import Title from "../../components/Title";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTS":
      const newContacts = action.payload.filter(
        (contact) => !state.some((c) => c.id === contact.id)
      );
      return [...state, ...newContacts];
    case "UPDATE_CONTACTS":
      const updatedContacts = state.map((c) =>
        c.id === action.payload.id ? action.payload : c
      );
      if (!state.some((c) => c.id === action.payload.id)) {
        updatedContacts.unshift(action.payload);
      }
      return updatedContacts;
    case "DELETE_CONTACT":
      return state.filter((c) => c.id !== action.payload);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  searchFilterContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
  },
  searchInput: {
    padding: "13px",
    borderRadius: "13px",
    border: "1px solid #ccc",
    width: "50%",
  },
  tagsFilter: {
    padding: "13px",
    borderRadius: "13px",
    border: "1px solid #ccc",
    width: "50%",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "13px",
  },
  buttonSize: {
    maxWidth: "36px",
    maxHeight: "36px",
    padding: theme.spacing(1),
  },
}));

const Contacts = () => {
  const classes = useStyles();
  const history = useHistory();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [filteredTags, setFilteredTags] = useState([]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam, filteredTags]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await api.get("/contacts/", {
          params: { searchParam, pageNumber },
        });
        const filteredContacts = data.contacts.filter((contact) => {
          if (filteredTags.length === 0) return true;
          return filteredTags.every((tag) =>
            contact.tags?.some((ctag) => ctag.id === tag.id)
          );
        });
        dispatch({ type: "LOAD_CONTACTS", payload: filteredContacts });
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (loading) {
      const delay = setTimeout(() => fetchContacts(), 500);
      return () => clearTimeout(delay);
    }
  }, [loading, searchParam, pageNumber, filteredTags]);

  useEffect(() => {
    const socket = openSocket();
    socket.on("contact", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }
      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });
    return () => socket.disconnect();
  }, []);

  const handleSearch = (e) => {
    setSearchParam(e.target.value.toLowerCase());
  };

  const handleTagFilter = (tags) => setFilteredTags(tags);

  const loadMore = () => setPageNumber((prev) => prev + 1);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (!loading && scrollHeight - scrollTop - 100 <= clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>
          {i18n.t("contacts.title")} ({contacts.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <Tooltip title={i18n.t("contacts.buttons.add")}>
            <Button
              variant="contained"
              color="primary"
              className={classes.buttonSize}
              onClick={() => {}}
            >
              <AddCircleOutline />
            </Button>
          </Tooltip>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <div className={classes.searchFilterContainer}>
        <TextField
          variant="outlined"
          placeholder="Buscar contatos"
          value={searchParam}
          onChange={handleSearch}
          className={classes.searchInput}
        />
        <TagsFilter
          onFiltered={handleTagFilter}
          className={classes.tagsFilter}
        />
      </div>
      <Paper className={classes.mainPaper} onScroll={handleScroll}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell>{i18n.t("contacts.table.email")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Contacts;
