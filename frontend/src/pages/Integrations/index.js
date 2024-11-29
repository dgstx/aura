import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";
import { 
  Container, 
  makeStyles, 
  Paper, 
  TextField, 
  Typography, 
  Grid,
  Card,
  CardContent,
  CardHeader
} from "@material-ui/core";
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(4)
  },
  pageTitle: {
    marginBottom: theme.spacing(4),
    color: theme.palette.text.primary,
    fontWeight: 600
  },
  card: {
    borderRadius: 13,
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing(3)
  },
  cardHeader: {
    backgroundColor: '#f0f0f0',
    padding: theme.spacing(2),
    borderBottom: '1px solid #e0e0e0'
  },
  cardContent: {
    padding: theme.spacing(3)
  },
  textField: {
    borderRadius: 13,
    '& .MuiOutlinedInput-root': {
      borderRadius: 13
    }
  }
}));

const Integrations = () => {
  const classes = useStyles();
  const [integrations, setIntegrations] = useState([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/integrations");
        setIntegrations(data);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const socket = openSocket(process.env.REACT_APP_BACKEND_URL);

    socket.on("integrations", data => {
      if (data.action === "update") {
        setIntegrations(prevState => {
          const aux = [...prevState];
          const integrationIndex = aux.findIndex(s => s.key === data.integration.key);
          aux[integrationIndex].value = data.integration.value;
          return aux;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChangeIntegration = async e => {
    const selectedValue = e.target.value;
    const integrationKey = e.target.name;

    try {
      await api.put(`/integrations/${integrationKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("integrations.success"));
    } catch (err) {
      toastError(err);
    }
  };

  const getIntegrationValue = key => {
    const { value } = integrations.find(s => s.key === key);
    return value;
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="md">
        <Typography 
          variant="h5" 
          className={classes.pageTitle}
        >
          {i18n.t("integrations.title")}
        </Typography>

        <Card className={classes.card}>
          <CardHeader 
            title={i18n.t("integrations.integrations.openai.title")}
            className={classes.cardHeader}
            titleTypographyProps={{variant: 'h6'}}
          />
          <CardContent className={classes.cardContent}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  className={classes.textField}
                  variant="outlined"
                  label={i18n.t("integrations.integrations.openai.organization")}
                  name="organization"
                  value={integrations && integrations.length > 0 && getIntegrationValue("organization")}
                  onChange={handleChangeIntegration}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  className={classes.textField}
                  variant="outlined"
                  label={i18n.t("integrations.integrations.openai.apikey")}
                  name="apikey"
                  type="password"
                  value={integrations && integrations.length > 0 && getIntegrationValue("apikey")}
                  onChange={handleChangeIntegration}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card className={classes.card}>
          <CardHeader 
            title={i18n.t("integrations.integrations.n8n.title")}
            className={classes.cardHeader}
            titleTypographyProps={{variant: 'h6'}}
          />
          <CardContent className={classes.cardContent}>
            <TextField
              fullWidth
              className={classes.textField}
              variant="outlined"
              label={i18n.t("integrations.integrations.n8n.urlApiN8N")}
              name="urlApiN8N"
              value={integrations && integrations.length > 0 && getIntegrationValue("urlApiN8N")}
              onChange={handleChangeIntegration}
            />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
};

export default Integrations;