import React from "react"
import Layout from "../components/layout";

const CV = () => {
  return (
    <Layout>
      <p>
        Click{" "}
        <a
          rel="noopener noreferrer"
          href={"/pdf/cv-adam-coogan.pdf"}
          target="_blank"
        >
          here
        </a>{" "}
        to download my CV as a PDF.
      </p>
    </Layout>
  )
}

export default CV
