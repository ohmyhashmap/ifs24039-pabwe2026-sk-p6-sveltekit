/** Pengganti `$app/state` yang reaktif, meniru perilaku `page` asli. */
export const page = $state({
  url: new URL("http://localhost/"),
  params: {} as Record<string, string>,
  status: 404,
  error: null as null | { message: string },
});
