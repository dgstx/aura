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

const QueueSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, i18n.t("queueModal.validation.tooShort"))
        .max(50, i18n.t("queueModal.validation.tooLong"))
        .required(i18n.t("queueModal.validation.required")),
    color: Yup.string().required(i18n.t("queueModal.validation.required")),
    greetingMessage: Yup.string(),
    startWork: Yup.string(),
    endWork: Yup.string(),
    absenceMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
    const classes = useStyles();

    const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
    const [queue, setQueue] = useState({
        name: "",
        color: "",
        greetingMessage: "",
        startWork: "",
        endWork: "",
        absenceMessage: "",
    });

    useEffect(() => {
        if (!queueId) return;
        (async () => {
            try {
                const { data } = await api.get(`/queue/${queueId}`);
                setQueue(data);
            } catch (err) {
                toastError(err);
            }
        })();

        return () => {
            setQueue({
                name: "",
                color: "",
                greetingMessage: "",
                startWork: "",
                endWork: "",
                absenceMessage: "",
            });
        };
    }, [queueId]);

    const handleSaveQueue = async (values) => {
        try {
            if (queueId) {
                await api.put(`/queue/${queueId}`, values);
            } else {
                await api.post("/queue", values);
            }
            toast.success(i18n.t("queueModal.notification.success"));
            onClose();
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            classes={{ paper: classes.dialog }}
        >
            <DialogTitle className={classes.dialogTitle}>
                {queueId
                    ? i18n.t("queueModal.title.edit")
                    : i18n.t("queueModal.title.add")}
            </DialogTitle>
            <Formik
                initialValues={queue}
                enableReinitialize
                validationSchema={QueueSchema}
                onSubmit={(values, actions) => {
                    handleSaveQueue(values);
                    actions.setSubmitting(false);
                }}
            >
                {({ touched, errors, values, isSubmitting, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.name")}
                                        name="name"
                                        variant="outlined"
                                        fullWidth
                                        className={classes.textField}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.color")}
                                        name="color"
                                        variant="outlined"
                                        fullWidth
                                        className={classes.textField}
                                        error={touched.color && Boolean(errors.color)}
                                        helperText={touched.color && errors.color}
                                        onClick={() => setColorPickerModalOpen(true)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <div
                                                        style={{ backgroundColor: values.color }}
                                                        className={classes.colorAdornment}
                                                    />
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setColorPickerModalOpen(true)}
                                                >
                                                    <Colorize />
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                    {colorPickerModalOpen && (
                                        <div className={classes.colorPickerPopover}>
                                            <div
                                                className={classes.colorPickerCover}
                                                onClick={() => setColorPickerModalOpen(false)}
                                            />
                                            <ChromePicker
                                                color={values.color}
                                                onChange={(color) => {
                                                    setFieldValue("color", color.hex);
                                                }}
                                            />
                                        </div>
                                    )}
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.greetingMessage")}
                                        name="greetingMessage"
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        className={classes.textField}
                                        error={
                                            touched.greetingMessage &&
                                            Boolean(errors.greetingMessage)
                                        }
                                        helperText={
                                            touched.greetingMessage &&
                                            errors.greetingMessage
                                        }
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.startWork")}
                                        name="startWork"
                                        type="time"
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        className={classes.textField}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.endWork")}
                                        name="endWork"
                                        type="time"
                                        variant="outlined"
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        className={classes.textField}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("queueModal.form.absenceMessage")}
                                        name="absenceMessage"
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        className={classes.textField}
                                        error={
                                            touched.absenceMessage &&
                                            Boolean(errors.absenceMessage)
                                        }
                                        helperText={
                                            touched.absenceMessage &&
                                            errors.absenceMessage
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={onClose}
                                color="secondary"
                                variant="outlined"
                                disabled={isSubmitting}
                            >
                                {i18n.t("queueModal.buttons.cancel")}
                            </Button>
                            <div className={classes.btnWrapper}>
                                <Button
                                    type="submit"
                                    color="primary"
                                    variant="contained"
                                    disabled={isSubmitting}
                                >
                                    {queueId
                                        ? i18n.t("queueModal.buttons.okEdit")
                                        : i18n.t("queueModal.buttons.okAdd")}
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

export default QueueModal;