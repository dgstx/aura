import React, { useEffect, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { Colorize } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { ChromePicker } from "react-color";
import QueueSelect from "../QueueSelect";

const useStyles = makeStyles((theme) => ({
    dialog: {
        borderRadius: 13,
    },
    dialogTitle: {
        paddingBottom: theme.spacing(2),
        fontWeight: 600,
        fontSize: "1.2rem",
    },
    textField: {
        margin: theme.spacing(1, 0),
        borderRadius: 13,
    },
    colorAdornment: {
        width: 20,
        height: 20,
        borderRadius: "50%",
    },
    btnWrapper: {
        position: "relative",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    colorPickerPopover: {
        position: "absolute",
        zIndex: 2,
    },
    colorPickerCover: {
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
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
        isDisplay: false
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
                setColor(data?.color)
                const whatsQueueIds = data.queues?.map(queue => queue.id);
                setSelectedQueueIds(whatsQueueIds);
            } catch (err) {
                toastError(err);
            }
        };
        fetchSession();
    }, [whatsAppId]);

    const handleSaveWhatsApp = async values => {
        const whatsappData = { ...values, queueIds: selectedQueueIds, color: color };
        try {
            if (isHubSelected && selectedChannel) {
                const selectedChannelObj = availableChannels.find(
                    channel => channel.id === selectedChannel
                );

                if (selectedChannelObj) {
                    const channels = [selectedChannelObj];
                    await api.post("/hub-channel/", {
                        ...whatsappData,
                        channels
                    });
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
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            classes={{ paper: classes.dialog }}
        >
            <DialogTitle className={classes.dialogTitle}>
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
                {({ values, touched, errors, isSubmitting, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("whatsappModal.form.name")}
                                        autoFocus
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        fullWidth
                                        className={classes.textField}
                                    />
                                </Grid>
                                {!isHubSelected && (
                                    <>
                                        <Grid item xs={12}>
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
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("queueModal.form.greetingMessage")}
                                                type="greetingMessage"
                                                multiline
                                                minRows={5}
                                                fullWidth
                                                name="greetingMessage"
                                                error={
                                                    touched.greetingMessage && Boolean(errors.greetingMessage)
                                                }
                                                helperText={
                                                    touched.greetingMessage && errors.greetingMessage
                                                }
                                                variant="outlined"
                                                className={classes.textField}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                label={i18n.t("whatsappModal.form.farewellMessage")}
                                                type="farewellMessage"
                                                multiline
                                                minRows={5}
                                                fullWidth
                                                name="farewellMessage"
                                                error={
                                                    touched.farewellMessage && Boolean(errors.farewellMessage)
                                                }
                                                helperText={
                                                    touched.farewellMessage && errors.farewellMessage
                                                }
                                                variant="outlined"
                                                className={classes.textField}
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                label="Color"
                                                onClick={() => setShowColorPicker(show => !show)}
                                                value={color}
                                                variant="outlined"
                                                fullWidth
                                                className={classes.textField}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <div className={classes.colorAdornment} style={{ backgroundColor: color }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setShowColorPicker(true)}
                                                        >
                                                            <Colorize />
                                                        </IconButton>
                                                    ),
                                                }}
                                            />
                                            {showColorPicker && (
                                                <div className={classes.colorPickerPopover}>
                                                    <div
                                                        className={classes.colorPickerCover}
                                                        onClick={() => setShowColorPicker(false)}
                                                    />
                                                    <ChromePicker
                                                        color={color}
                                                        onChange={(color) => {
                                                            setFieldValue("color", color.hex);
                                                            handleColorChange(color);
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </Grid>
                                        <Grid item xs={12}>
                                            <QueueSelect
                                                selectedQueueIds={selectedQueueIds}
                                                onChange={selectedIds => setSelectedQueueIds(selectedIds)}
                                            />
                                        </Grid>
                                    </>
                                )}
                                {isHubSelected && (
                                    <Grid item xs={12}>
                                        <Select
                                            label="Selecionar Canal"
                                            fullWidth
                                            value={selectedChannel || ""}
                                            onChange={e => {
                                                const value = e.target.value;
                                                setSelectedChannel(value);
                                            }}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                Selecione um canal
                                            </MenuItem>
                                            {availableChannels.map(channel => (
                                                <MenuItem key={channel.id} value={channel.id}>
                                                    {channel.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                variant="outlined"
                                disabled={isSubmitting}
                            >
                                {i18n.t("whatsappModal.buttons.cancel")}
                            </Button>
                            <div className={classes.btnWrapper}>
                                <Button
                                    type="submit"
                                    color="primary"
                                    variant="contained"
                                    disabled={isSubmitting}
                                >
                                    {whatsAppId
                                        ? i18n.t("whatsappModal.buttons.okEdit")
                                        : i18n.t("whatsappModal.buttons.okAdd")}
                                </Button>
                                {isSubmitting && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </div>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default React.memo(WhatsAppModal);