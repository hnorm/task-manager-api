import express from "express"
import auth from "../middleware/auth.mjs"
import Task from "../models/task.mjs"

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task)
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if (req.query.completed !== undefined) {
        match.completed = req.query.completed === 'true'
    }

    const sort = {}
    if (req.query.SortBy !== undefined) {
        const parts = req.query.SortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    }
    catch (error) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        else {
            res.send(task)
        }
    }
    catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidUpdate = updates.every(x => allowedUpdates.includes(x))
    if (!isValidUpdate) {
        return res.status(400).send({ error: "Invalid fields updated" })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        updates.forEach(update => task[update] = req.body[update])
        await task.save()
        if (!task) {
            return res.status(404).send()
        }
        else {
            res.send(task)
        }
    }
    catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const result = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!result) {
            return res.status(404).send()
        }
        else {
            res.send(result)
        }
    }
    catch (error) {
        res.status(500).send(error)
    }
})

export default router