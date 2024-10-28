import cron from 'node-cron';
import connectDB from './db';
import UrlModel from './models/url';

async function checkUrls() {
  try {
    await connectDB();
    const urls = await UrlModel.find({
      nextCheck: { $lte: new Date() }
    });

    for (const url of urls) {
      try {
        const response = await fetch(url.url);
        const status = response.ok ? 'up' : 'down';
        
        await UrlModel.findByIdAndUpdate(url._id, {
          status,
          lastChecked: new Date(),
          nextCheck: new Date(Date.now() + url.checkInterval * 24 * 60 * 60 * 1000),
          $inc: { checksCount: 1 },
          lastStatus: {
            code: response.status,
            message: response.statusText
          }
        });
      } catch (error) {
        await UrlModel.findByIdAndUpdate(url._id, {
          status: 'down',
          lastChecked: new Date(),
          nextCheck: new Date(Date.now() + url.checkInterval * 24 * 60 * 60 * 1000),
          $inc: { checksCount: 1 },
          lastStatus: {
            code: 0,
            message: error.message
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in cron job:', error);
  }
}

// Run every hour
export function startCronJob() {
  cron.schedule('0 * * * *', checkUrls);
}