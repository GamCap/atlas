export const Footer = () => {
  return (
    <footer className="py-4 px-1 lg:px-2 text-center container">
      <div className="container mx-auto">
        <p className=" text-basic-10-auto-regular sm:text-basic-12-auto-regular text-neutral-600 sm:text-end">
          &copy; 2024 - Developed by{" "}
          <strong>
            <a href=" https://gamcaplabs.com" target="_blank">
              GamCap Labs
            </a>
          </strong>{" "}
          with the support of the{" "}
          <strong>
            <a href="https://worldcoin.foundation/" target="_blank">
              Worldcoin Foundation
            </a>
          </strong>
        </p>
      </div>
    </footer>
  );
};
