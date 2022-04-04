import express from "express"
import User from "../models/user.mjs"
import auth from "../middleware/auth.mjs"
import multer from "multer"
import sharp from "sharp"
import email from "../emails/account.mjs"

const router = new express.Router()

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        email.sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }
    catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(t => t.token !== req.token)
        await req.user.save()
        res.send()
    }
    catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    }
    catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(undefined, true)
        }
        else {
            cb(new Error('File must be a jpg, jpeg or png'))
        }

        // cb(undefined, false)
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }
    catch (error) {
        res.status(404).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }
    catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidUpdate = updates.every(x => allowedUpdates.includes(x))
    if (!isValidUpdate) {
        return res.status(400).send({ error: "Invalid fields updated" })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        email.sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }
    catch (error) {
        res.status(500).send(error)
    }
})

export default router