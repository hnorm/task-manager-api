import express from "express"
import "./db/mongoose.mjs"

import userRouter from "./routers/user.mjs"
import taskRouter from "./routers/task.mjs"

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server listening on port ' + port)
})