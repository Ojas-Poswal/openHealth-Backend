import { Router } from "express";

const router = Router()

router.get("/",(req,res)=>{
    res.send("openHealth api is running")
})

export default Router;
