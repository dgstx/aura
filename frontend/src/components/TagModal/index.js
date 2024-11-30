import React, { useContext, useEffect, useState } from "react";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
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
import { ChromePicker } from "react-color";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

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

const TagSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, "Mensagem muito curta")
        .required("Obrigatório"),
});

const TagModal = ({ open, onClose, tagId, reload }) => {
    const classes = useStyles();
    const { user } = useContext(AuthContext);
    const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
    const initialState = {
        name: "",
        color: "",
    };
    const [tag, setTag] = useState(initialState);

    useEffect(() => {
        try {
            (async () => {
                if (!tagId) return;

                const { data } = await api.get(`/tags/${tagId}`);
                setTag((prevState) => {
                    return { ...prevState, ...data };
                });
            })();
        } catch (err) {
            toastError(err);
        }
    }, [tagId, open]);

    const handleClose = () => {
        setTag(initialState);
        setColorPickerModalOpen(false);
        onClose();
    };

    const handleSaveTag = async (values) => {
        const tagData = { ...values, userId: user.id };
        try {
            if (tagId) {
                await api.put(`/tags/${tagId}`, tagData);
            } else {
                await api.post("/tags", tagData);
            }
            toast.success(i18n.t("tagModal.success"));
            if (typeof reload == "function") {
                reload();
            }
        } catch (err) {
            toastError(err);
        }
        handleClose();
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
                {tagId
                    ? i18n.t("tagModal.title.edit")
                    : i18n.t("tagModal.title.add")}
            </DialogTitle>
            <Formik
                initialValues={tag}
                enableReinitialize={true}
                validationSchema={TagSchema}
                onSubmit={(values, actions) => {
                    handleSaveTag(values);
                    actions.setSubmitting(false);
                }}
            >
                {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                    <Form>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("tagModal.form.name")}
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
                                        label={i18n.t("tagModal.form.color")}
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
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleClose}
                                color="secondary"
                                variant="outlined"
                                disabled={isSubmitting}
                            >
                                {i18n.t("tagModal.buttons.cancel")}
                            </Button>
                            <div className={classes.btnWrapper}>
                                <Button
                                    type="submit"
                                    color="primary"
                                    variant="contained"
                                    disabled={isSubmitting}
                                >
                                    {tagId
                                        ? i18n.t("tagModal.buttons.okEdit")
                                        : i18n.t("tagModal.buttons.okAdd")}
                                    {isSubmitting && (
                                        <CircularProgress
                                            size={24}
                                            className={classes.buttonProgress}
                                        />
                                    )}
                                </Button>
                            </div>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default TagModal;