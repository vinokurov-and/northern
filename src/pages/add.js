import { TextareaAutosize } from "@mui/material";
import React, { useState } from "react";

const AddPage = (props) => {
    const [image, setImage] = useState()

    const handleChangeImage = (e) => {
        setImage(e.target.files[0]);
    }

    const [pass, setPass] = useState();
    const handleChangePass = (e) => {
        setPass(e.target.value)
    }

    const [title, setTitle] = useState();
    const handleChangeTitle = (e) => {
        setTitle(e.target.value);
    }

    const [description, setDescription] = useState();
    const handleChangeDescription = (e) => {
        setDescription(e.target.value);
    }

    const handleSend = async () => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);
        formData.append('pass', pass);
        formData.append('description', description);
        const a = await fetch('/c/addNews', {
            method: 'POST',
            body: formData
        });

        const json = await a.json();
        if (json.ok) {
            window.alert('Успешно');
        } else {
            window.alert('Не успех')
        }
    }

    return (
        <div>
            <p>News</p>
            <form style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 400,
                gap: 20
            }} action="/c/addNews" noValidate method="POST">
                <input placeholder="pass" type="text" name="pass" value={pass} onChange={handleChangePass} />
                <input placeholder="title" type="text" name="title" onChange={handleChangeTitle} />
                <TextareaAutosize name="description" placeholder="description" onChange={handleChangeDescription} />
                <input type="file" onChange={handleChangeImage} name="image" />
                <button type="button" onClick={handleSend}>Send</button>
            </form>
        </div>
    )
}

export default AddPage;