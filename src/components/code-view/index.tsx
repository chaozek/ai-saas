import { useEffect } from "react"
import "./code-theme.css"
import Prism from "prismjs"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-css"

export const CodeView = ({code, lang}: {code: string, lang: string}) => {
     useEffect(() => {
          // Ensure the language exists
          if (Prism.languages[lang]) {
               // Manually highlight the code instead of using highlightAll
               const highlightedCode = Prism.highlight(
                    code,
                    Prism.languages[lang],
                    lang
               )
               // Find the code element and update its innerHTML
               const codeElement = document.querySelector(`code.language-${lang}`)
               if (codeElement) {
                    codeElement.innerHTML = highlightedCode
               }
          }
     }, [code, lang]) // Re-run when code or language changes

     return (
          <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
               <code className={`language-${lang}`}>{code}</code>
          </pre>
     )
}