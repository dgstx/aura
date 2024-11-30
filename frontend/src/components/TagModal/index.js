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
    IconButton,
    InputAdornment,
    makeStyles,
    TextField,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { Colorize } from "@material-ui/icons";
import { ColorBox } from "material-ui-color";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        padding: theme.spacing(2),
    },
    dialog: {
        borderRadius: 13,  // Adiciona borda arredondada no modal
    },
    dialogContent: {
        paddingBottom: theme.spacing(2),
    },
    multFieldLine: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    colorAdorment: {
        width: 20,
        height: 20,
        borderRadius: "50%",
    },
    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    btnWrapper: {
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    inputField: {
        borderRadius: "13px", // Arredondar bordas dos campos de entrada
    },
    actionButton: {
        borderRadius: "13px", // Arredondar bordas do botão
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
        <div className={classes.root}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
                scroll="paper"
                className={classes.dialog} // Apliquei o estilo de borda arredondada
            >
                <DialogTitle id="form-dialog-title">
                    {tagId
                        ? `${i18n.t("tagModal.title.edit")}`
                        : `${i18n.t("tagModal.title.add")}`}
                </DialogTitle>
                <Formik
                    initialValues={tag}
                    enableReinitialize={true}
                    validationSchema={TagSchema}
                    onSubmit={(values, actions) => {
                        setTimeout(() => {
                            handleSaveTag(values);
                            actions.setSubmitting(false);
                        }, 400);
                    }}
                >
                    {({ touched, errors, isSubmitting, values }) => (
                        <Form>
                            <DialogContent dividers className={classes.dialogContent}>
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        label={i18n.t("tagModal.form.name")}
                                        name="name"
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        variant="outlined"
                                        margin="dense"
                                        fullWidth
                                        className={classes.inputField}
                                    />
                                </div>
                                <div className={classes.multFieldLine}>
                                    <Field
                                        as={TextField}
                                        fullWidth
                                        label={i18n.t("tagModal.form.color")}
                                        name="color"
                                        id="color"
                                        error={touched.color && Boolean(errors.color)}
                                        helperText={touched.color && errors.color}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <div
                                                        style={{
                                                            backgroundColor: values.color,
                                                        }}
                                                        className={classes.colorAdorment}
                                                    ></div>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() =>
                                                        setColorPickerModalOpen(!colorPickerModalOpen)
                                                    }
                                                >
                                                    <Colorize />
                                                </IconButton>
                                            ),
                                        }}
                                        variant="outlined"
                                        margin="dense"
                                        className={classes.inputField}
                                    />
                                </div>
                                {colorPickerModalOpen && (
                                    <div>
                                        <ColorBox
                                            disableAlpha={true}
                                            hslGradient={false}
                                            style={{ margin: "20px auto 0" }}
                                            value={tag.color}
                                            onChange={(val) => {
                                                setTag((prev) => ({ ...prev, color: `#${val.hex}` }));
                                            }}
                                        />
                                    </div>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    onClick={handleClose}
                                    color="secondary"
                                    disabled={isSubmitting}
                                    variant="outlined"
                                    className={classes.actionButton}
                                >
                                    {i18n.t("tagModal.buttons.cancel")}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    disabled={isSubmitting}
                                    variant="contained"
                                    className={classes.btnWrapper}
                                >
                                    {tagId
                                        ? `${i18n.t("tagModal.buttons.okEdit")}`
                                        : `${i18n.t("tagModal.buttons.okAdd")}`}
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

export default TagModal;
