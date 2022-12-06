import fetch from 'node-fetch';
// import { Contest } from '../types/contest'

export const getApiContestData = async () => {

    console.log('this is for testing the replacemt of contest Data');
    // let data : Contest[] = [];
    let data;
    const response = await fetch(`${process.env.C4_API_URL}/api/v0/getContest`, {
        method: 'GET',
    })
    .then((res) => res.json())
    .then((body) => {
        data = body;
    })
    .catch((err) => console.log(err))

return data;
}