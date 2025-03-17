async function fetchData() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  return res;
}
