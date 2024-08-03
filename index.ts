import express, { Request, Response } from 'express';
import {PrismaClient} from "@prisma/client";
import {getListImage} from "./services/service";

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const prisma = new PrismaClient();

app.get('/setting', async (_req: Request, res: Response) => {
    try {
        const setting = await prisma.setting.findFirst({
            where: { status: 'active' }
        })
        res.status(200).send(setting);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/setting', async (req: Request, res: Response) => {
    const requestBody = req.body;
    try {
        const setting = await prisma.setting.create({
            data: requestBody
        });
        res.status(200).send(setting);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.put('/setting/:id', async(req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const setting = await prisma.setting.update({
            where: { id },
            data: req.body
        });
        res.status(200).send(setting);
    } catch (error) {
        res.status(500).send(error);
    }
});


app.get('/images', async (req: Request, res: Response) => {
    const { keyword } = req.body;
    try {
        const response = await getListImage(keyword)
        res.status(200).send(response);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.get('/prev', async (req: Request, res: Response) => {
    const { keyword } = req.body;
    try {
        let history = await prisma.history.findFirst({
            where: { keyword }
        });
        if(!history){
            res.status(500).send('No history found');
            return;
        }
        if(history.skip > 0){
            const prev = history.skip - 1;
            history = await prisma.history.update({
                where: { id: history.id }, // Use unique identifier 'id'
                data: { skip: prev }
            });
        }
        res.status(200).send(history);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get('/next', async (req: Request, res: Response) => {
    const { keyword } = req.body;
    try {
        let history = await prisma.history.findFirst({
            where: { keyword }
        });
        if(!history){
            res.status(500).send('No history found');
            return;
        }
        const next = history.skip + 1;
        if(next < history.limit){
            history = await prisma.history.update({
                where: { id: history.id },
                data: { skip: next }
            });
        }
        res.status(200).send(history);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post('/favorite', async (req: Request, res: Response) => {
    const  requestBody = req.body;
    try {
        const favorite = await prisma.favorite.create({
            data: requestBody
        });
        res.status(200).send(favorite);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.get('/favorites', async (_req: Request, res: Response) => {
    try {
        const favorites = await prisma.favorite.findMany()
        res.status(200).send(favorites);
    } catch (error) {
        res.status(500).send(error);
    }
});

const localIP = '192.168.1.3';
app.listen(port, localIP, () => {
    console.log(`Server is running at http://${localIP}:${port}`);
});
