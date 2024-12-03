
class onCreate(){

    lifecycleScope.launch{
        Toast(context, fetch().toString());
        
    }
}

suspend fun fetch(): String?{
    const val url = "https://mock.com"

    try{
        const result = axios.fetch(url)

        const resp = result.response

        return resp.name
    }catch{

    }
    

}