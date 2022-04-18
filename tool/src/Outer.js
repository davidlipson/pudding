import App from "./App"

function Outer() {
    const queryParams = new URLSearchParams(window.location.search)
    const query_id = queryParams.get("query")
    console.log(query_id)
  
    return (
      <App query_id={query_id}/>
    )
  }
  
  export default Outer