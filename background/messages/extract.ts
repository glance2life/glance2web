import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { schema } = req.body.rule

    const [currentTab] = await chrome.tabs.query({ active: true })
    const docResult = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      world: "MAIN",
      func: () => {
        function getVisibleText() {
          function isVisible(element) {
            if (element.nodeType !== 1) {
              return true
            }

            const style = window.getComputedStyle(element)
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            )
          }

          function getTextFromElement(element) {
            if (
              element.tagName === "SCRIPT" ||
              element.tagName === "STYLE" ||
              !isVisible(element)
            ) {
              return ""
            }

            if (element.nodeType === Node.TEXT_NODE) {
              return element.nodeValue.trim()
            }

            const res = []
            for (const child of element.childNodes) {
              res.push(getTextFromElement(child).trim())
            }

            return res.join(" ")
          }

          return getTextFromElement(document.body)
        }

        return getVisibleText()
      }
    })
    const docContent = docResult?.[0]?.result

    // @ts-ignore
    const session = await chrome.aiOriginTrial.languageModel.create({
      systemPrompt: `You are a JSON generator. Based on the provided text and JSON Schema, extract relevant information to create a valid JSON object:

- Use the Schema's field names and descriptions to interpret each field.
- Extract data from the text to populate the fields. If a field is missing, set its value to null.
- Follow the Schema's structure, including arrays and nested objects.
- Output a valid JSON string.

Example:

Text:
"""
John is 30 years old and loves basketball. His pet is a dog named Buddy.
"""

Schema:
"""
{
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "The user's name" },
    "age": { "type": "integer", "description": "The user's age" },
    "pet": {
      "type": "object",
      "properties": {
        "name": { "type": "string", "description": "Pet's name" },
        "type": { "type": "string", "description": "Pet's type" }
      }
    }
  }
}
"""

Output:
"""
{
  "name": "John",
  "age": 30,
  "pet": {
    "name": "Buddy",
    "type": "dog"
  }
}
"""
`})

    const result: string = await session.prompt(`
Text: 
"""
${docContent}
"""
Schema:  
"""
${schema}
"""
Generate the JSON.
`)

    res.send({
      success: true,
      data: result
        .replace(/^```json/, "")
        .replace(/```$/, "")
        .trim()
    })
  } catch (e) {
    console.error(e)
    res.send({
      success: false,
      errorMessage: e?.message
    })
  }
}

export default handler
