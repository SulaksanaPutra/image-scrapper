const getListImage = () =>{
    return scrapper(async ({keyword, limit, skip}) => {
    try {
        const fullUrl = `${apiUrl}/post/search` + encodeURIComponent(request)
        const response = await fetch(fullUrl, {
            headers: {
                'X-Origin': domainUrl
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return [];
    }
}, domainUrl, {keyword, limit, skip});
}
const getDetailImage = () =>{
    return scrapper(async ({id}) => {
    try {
        const fullUrl = `${apiUrl}/post/detail` + encodeURIComponent(request)
        const response = await fetch(fullUrl, {
            headers: {
                'X-Origin': domainUrl
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        return {};
    }
}, domainUrl, {id});
}