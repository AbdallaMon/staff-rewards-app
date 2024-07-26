export default function AuthLayout({ children }) {
  return (
    <>
      <div className={"w-full h-full min-h-screen"}>
        {children}
      </div>
    </>
  );
}
