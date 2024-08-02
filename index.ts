import express, { Request, Response } from 'express';
import path from 'path';
import { db, resultsDb, favoritesDb } from './db';

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/mode', (req: Request, res: Response) => {
    const { mode } = req.body;
    try {
        db.set('settings.baseUrl', mode).write();
        res.status(200).send({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/search', async (req: Request, res: Response) => {
    const { keyword, limit } = req.body;
    try {
        db.set('settings', { ...db.get('settings').value(), keyword, limit, skip: 0 }).write();
        const results = await scrapper(keyword, limit, 0); // Ensure scrapper function is typed properly
        res.json(results[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/prev', (req: Request, res: Response) => {
    try {
        const setting = db.get('settings').value();
        const images = resultsDb.get('results').value();
        const prev = setting.prev - 1;
        db.set('settings.prev', prev).write();

        res.json(images[prev] || {});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading or writing files');
    }
});

app.get('/next', (req: Request, res: Response) => {
    try {
        const setting = db.get('settings').value();
        const images = resultsDb.get('results').value();

        const current = setting.current + 1;
        db.set('settings.current', current).write();

        res.json(images[current] || {});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading or writing files');
    }
});

app.get('/love', (req: Request, res: Response) => {
    try {
        const setting = db.get('settings').value();
        const images = resultsDb.get('results').value();
        const favorites = favoritesDb.get('favorites').value();

        favorites.push(images[setting.current]);
        favoritesDb.set('favorites', favorites).write();

        res.json('success');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading or writing files');
    }
});

app.get('/favorites', (req: Request, res: Response) => {
    res.json(favoritesDb.get('favorites').value());
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const localIP = '192.168.1.3';
app.listen(port, localIP, () => {
    console.log(`Server is running at http://${localIP}:${port}`);
});
