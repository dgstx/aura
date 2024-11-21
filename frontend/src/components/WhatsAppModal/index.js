import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { FileCopyOutlined, InfoOutlined } from "@material-ui/icons";
import ColorLensIcon from "@material-ui/icons/ColorLens";
import { SketchPicker } from "react-color";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(2),
  },
  formContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    width: "100%",
    maxWidth: "600px",
    padding: theme.spacing(2),
    backgroundColor: "#f9f9f9",
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  },
  textFieldFullWidth: {
    gridColumn: "span 2",
  },
  buttonWrapper: {
    position: "relative",
    display: "flex",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const SessionSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const WhatsAppModal = ({ open, onClose, whatsAppId }) => {
  const classes = useStyles();

  const initialState = {
    name: "",
    greetingMessage: "",
    farewellMessage: "",
    isDefault: false,
    isDisplay: false,
  };

  const [whatsApp, setWhatsApp] = useState(initialState);
  const [selectedQueueIds, setSelectedQueueIds] = useState([]);
  const [isHubSelected, setIsHubSelected] = useState(false);
  const [availableChannels, setAvailableChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [color, setColor] = useState("#5C59A0");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color) => {
    setColor(color.hex);
  };

  const fetchChannels = async () => {
    try {
      const { data } = await api.get("/hub-channel/");
      setAvailableChannels(data);
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    console.log("selectedChannel has changed:", selectedChannel);
  }, [selectedChannel]);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;
      try {
        const { data } = await api.get(`whatsapp/${whatsAppId}`);
        setWhatsApp(data);
        setColor(data?.color);
        const whatsQueueIds = data.queues?.map((queue) => queue.id);
        setSelectedQueueIds(whatsQueueIds);
      } catch (err) {
        toastError(err);
      }
    };
    fetchSession();
  }, [whatsAppId]);

  const handleSaveWhatsApp = async (values) => {
    const whatsappData = { ...values, queueIds: selectedQueueIds, color };
    try {
      if (isHubSelected && selectedChannel) {
        const selectedChannelObj = availableChannels.find(
          (channel) => channel.id === selectedChannel
        );
        if (selectedChannelObj) {
          const channels = [selectedChannelObj];
          await api.post("/hub-channel/", { ...whatsappData, channels });
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } else {
        if (whatsAppId) {
          await api.put(`/whatsapp/${whatsAppId}`, whatsappData);
        } else {
          await api.post("/whatsapp", whatsappData);
        }
      }
      toast.success(i18n.t("whatsappModal.success"));
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleClose = () => {
    onClose();
    setWhatsApp(initialState);
    setIsHubSelected(false);
    setSelectedChannel("");
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {whatsAppId
            ? i18n.t("whatsappModal.title.edit")
            : i18n.t("whatsappModal.title.add")}
        </DialogTitle>
        <Formik
          initialValues={whatsApp}
          enableReinitialize={true}
          validationSchema={SessionSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveWhatsApp(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, touched, errors, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <div className={classes.formContainer}>
                  <Field
                    as={TextField}
                    label={i18n.t("whatsappModal.form.name")}
                    autoFocus
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                  />
                  {!isHubSelected && (
                    <>
                      <FormControlLabel
                        control={
                          <Field
                            as={Switch}
                            color="primary"
                            name="isDefault"
                            checked={values.isDefault}
                          />
                        }
                        label={i18n.t("whatsappModal.form.default")}
                      />
                      <FormControlLabel
                        control={
                          <Field
                            as={Switch}
                            color="primary"
                            name="isDisplay"
                            checked={values.isDisplay}
                          />
                        }
                        label={i18n.t("whatsappModal.form.display")}
                      />
                    </>
                  )}
                  {isHubSelected && (
                    <Select
                      label="Selecionar Canal"
                      fullWidth
                      value={selectedChannel || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedChannel(value);
                      }}
                      displayEmpty
                      className={classes.textFieldFullWidth}
                    >
                      <MenuItem value="" disabled>
                        Selecione um canal
                      </MenuItem>
                      {availableChannels.map((channel) => (
                        <MenuItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                  {!isHubSelected && (
                    <>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        type="greetingMessage"
                        multiline
                        minRows={5}
                        fullWidth
                        name="greetingMessage"
                        error={
                          touched.greetingMessage &&
                          Boolean(errors.greetingMessage)
                        }
                        helperText={
                          touched.greetingMessage && errors.greetingMessage
                        }
                        variant="outlined"
                        margin="dense"
                        className={classes.textFieldFullWidth}
                      />
                      <Field
                        as={TextField}
                        label={i18n.t("whatsappModal.form.farewellMessage")}
                        type="farewellMessage"
                        multiline
                        minRows={5}
                        fullWidth
                        name="farewellMessage"
                        error={
                          touched.farewellMessage &&
                          Boolean(errors.farewellMessage)
                        }
                        helperText={
                          touched.farewellMessage && errors.farewellMessage
                        }
                        variant="outlined"
                        margin="dense"
                        className={classes.textFieldFullWidth}
                      />
                      <TextField
                        label="Color"
                        onClick={() =>
                          setShowColorPicker((show) => !show)
                        }
                        value={color}
                        variant="outlined"
                        margin="dense"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <div
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  backgroundColor: color,
                                  borderRadius: "50%",
                                  border:
                                    "1px solid rgba(0,0,0,.23)",
                                }}
                              />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton aria-label="color picker">
                                <ColorLensIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                      {showColorPicker && (
                        <div style={{ position:"absolute"}}>
						<SketchPicker
                          color={color}
                          onChangeComplete={handleColorChange}
                        />
                      </div>
                    )}
                    <QueueSelect
                      selectedQueueIds={selectedQueueIds}
                      onChange={(selectedIds) =>
                        setSelectedQueueIds(selectedIds)
                      }
                    />
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                disabled={isSubmitting}
                variant="outlined"
              >
                {i18n.t("whatsappModal.buttons.cancel")}
              </Button>
              <Button
                type="submit"
                color="primary"
                disabled={isSubmitting}
                variant="contained"
                className={classes.buttonWrapper}
              >
                {whatsAppId
                  ? i18n.t("whatsappModal.buttons.okEdit")
                  : i18n.t("whatsappModal.buttons.okAdd")}
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  </div>
);
};

export default React.memo(WhatsAppModal);