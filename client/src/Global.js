global.Fetch = (url, myHeader = {}) => {
    let defaultHeader = {
        crossDomain:true,
        method: "GET",
        credentials: 'include',
        headers: new Headers({
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        })
    };
    return fetch(`${process.env.REACT_APP_API_URL}${url}`,{
        ...defaultHeader,
        ...myHeader
    }).then((response)=>{
        if (!response.ok)
            return response.json().then((res) => { return Promise.reject(res) });
        return response.json();
    })
}

global.payment_methods = [
    { label: "Bank Transaction", value: "Bank Transaction" },
    { label: "Cash", value: "Cash" },
    { label: "Cheque", value: "Cheque" },
    { label: "Credit Card", value: "Credit Card" },
    { label: "FPS", value: "FPS" },
    { label: "PayMe", value: "PayMe" },
    { label: "Online Payment", value: "Online Payment" },
    { label: "Other", value: "Other" }
]