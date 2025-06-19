import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Heading4, Heading5,
  List, ListOrdered, Link, Code, Palette, Copy, Eye, EyeOff, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { MediaSelectionDialog } from "../media/MediaSelectionDialog";

// Type definitions for our props
interface RichTextEditorProps {
  defaultContent: string;
  onChange: (content: string) => void;
  fieldName?: string;
  form?: any;
}

// Media item interface
interface MediaItem {
  id: string;
  fileName: string;
  spacesKey: string;
  link?: string;
  fileType: string;
  fileSize: number;
  altText?: string;
}

// This component handles rich text editing with proper HTML support and preview
const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  defaultContent, 
  onChange,
  fieldName,
  form
}) => {
  const [editorContent, setEditorContent] = useState(defaultContent || "");
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [showHTML, setShowHTML] = useState(false);
  const [htmlContent, setHtmlContent] = useState(defaultContent || "");
  const [previousTab, setPreviousTab] = useState("editor");
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const htmlEditorRef = useRef<HTMLTextAreaElement>(null);

  // Common colors for the color picker
  const colorOptions = [
    { name: "Default", value: "inherit" },
    { name: "Black", value: "#000000" },
    { name: "Gray", value: "#718096" },
    { name: "Red", value: "#E53E3E" },
    { name: "Orange", value: "#ED8936" },
    { name: "Yellow", value: "#ECC94B" },
    { name: "Green", value: "#48BB78" },
    { name: "Teal", value: "#38B2AC" },
    { name: "Blue", value: "#4299E1" },
    { name: "Indigo", value: "#667EEA" },
    { name: "Purple", value: "#9F7AEA" },
    { name: "Pink", value: "#ED64A6" }
  ];

  // Initialize the editor content
  useEffect(() => {
    if (defaultContent) {
      setEditorContent(defaultContent);
      setHtmlContent(defaultContent);
      
      // Initialize editor content when it's available
      if (editorRef.current) {
        editorRef.current.innerHTML = defaultContent;
      }
    }
  }, [defaultContent]);

  // Sync editor content when switching between tabs to prevent content loss
  useEffect(() => {
    if (previousTab !== activeTab) {
      // If switching from preview to editor
      if (previousTab === "preview" && activeTab === "editor") {
        // Make sure visual editor shows the current content when switching back
        if (editorRef.current && !showHTML) {
          // Important: preserve content from preview mode
          const contentToPreserve = editorContent;
          
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = contentToPreserve;
            }
          }, 0);
        }
        
        // Make sure HTML editor shows current content when switching back
        if (htmlEditorRef.current && showHTML) {
          htmlEditorRef.current.value = htmlContent;
        }
      }
      
      // If switching from editor to preview
      if (previousTab === "editor" && activeTab === "preview") {
        // Update editorContent from the current source
        const currentContent = showHTML ? htmlContent : 
          (editorRef.current ? editorRef.current.innerHTML : editorContent);
        
        setEditorContent(currentContent);
      }
      
      setPreviousTab(activeTab);
    }
  }, [activeTab, previousTab, editorContent, htmlContent, showHTML]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setPreviousTab(activeTab);
    setActiveTab(value);
  };

  // Handle direct HTML input
  const handleHtmlChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setHtmlContent(html);
    setEditorContent(html); // Update preview content as well
    
    // Update the visual editor when HTML is edited
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
    
    // Notify parent component
    if (onChange) {
      onChange(html);
    }
    
    // Update form value if using form integration
    if (form && fieldName) {
      form.setValue(fieldName, html);
    }
  }, [onChange, form, fieldName]);

  // Handle visual editor content changes
  const handleEditorChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    setEditorContent(content);
    setHtmlContent(content);
    
    // Notify parent component
    if (onChange) {
      onChange(content);
    }
    
    // Update form value if using form integration
    if (form && fieldName) {
      form.setValue(fieldName, content);
    }
  }, [onChange, form, fieldName]);

  // Insert formatting with improved handling
  const insertFormatting = useCallback((format: string, color: string | null = null) => {
    if (!editorRef.current) return;
    
    // If we're in HTML mode, we need to insert into the textarea
    if (showHTML && htmlEditorRef.current) {
      const textarea = htmlEditorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      let htmlTag = '';
      let closingTag = '';
      
      switch (format) {
        case 'h1': htmlTag = '<h1>'; closingTag = '</h1>'; break;
        case 'h2': htmlTag = '<h2>'; closingTag = '</h2>'; break;
        case 'h3': htmlTag = '<h3>'; closingTag = '</h3>'; break;
        case 'h4': htmlTag = '<h4>'; closingTag = '</h4>'; break;
        case 'h5': htmlTag = '<h5>'; closingTag = '</h5>'; break;
        case 'b': htmlTag = '<strong>'; closingTag = '</strong>'; break;
        case 'i': htmlTag = '<em>'; closingTag = '</em>'; break;
        case 'u': htmlTag = '<u>'; closingTag = '</u>'; break;
        case 'left': htmlTag = '<div style="text-align: left;">'; closingTag = '</div>'; break;
        case 'center': htmlTag = '<div style="text-align: center;">'; closingTag = '</div>'; break;
        case 'right': htmlTag = '<div style="text-align: right;">'; closingTag = '</div>'; break;
        case 'ul': htmlTag = '<ul>\n  <li>'; closingTag = '</li>\n</ul>'; break;
        case 'ol': htmlTag = '<ol>\n  <li>'; closingTag = '</li>\n</ol>'; break;
        case 'a': htmlTag = '<a href="#">'; closingTag = '</a>'; break;
        case 'code': htmlTag = '<code>'; closingTag = '</code>'; break;
        case 'color':
          if (color) {
            htmlTag = `<span style="color: ${color};">`; 
            closingTag = '</span>';
          }
          break;
        default: return;
      }
      
      // Insert HTML tags with the selected content in between
      const newValue = textarea.value.substring(0, start) + 
                      htmlTag + 
                      (selectedText || (format === 'ul' || format === 'ol' ? 'List item' : 'Text')) + 
                      closingTag + 
                      textarea.value.substring(end);
      
      setHtmlContent(newValue);
      setEditorContent(newValue); // Update preview content
      
      // Notify onChange
      onChange(newValue);
      if (form && fieldName) {
        form.setValue(fieldName, newValue);
      }
      
      // Update the textarea and visual editor
      textarea.value = newValue;
      if (editorRef.current) {
        editorRef.current.innerHTML = newValue;
      }
      
      // Set the cursor after the inserted text
      const newCursorPos = start + htmlTag.length + selectedText.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      
      return;
    }
    
    // Visual editor formatting
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    // Create the element
    let element;
    
    switch (format) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
        element = document.createElement(format);
        element.textContent = selectedText || `Heading ${format.substring(1)}`;
        if (color) element.style.color = color;
        break;
      case 'b':
        element = document.createElement('strong');
        element.textContent = selectedText || 'Bold text';
        if (color) element.style.color = color;
        break;
      case 'i':
        element = document.createElement('em');
        element.textContent = selectedText || 'Italic text';
        if (color) element.style.color = color;
        break;
      case 'u':
        element = document.createElement('u');
        element.textContent = selectedText || 'Underlined text';
        if (color) element.style.color = color;
        break;
      case 'left':
        element = document.createElement('div');
        element.style.textAlign = 'left';
        element.textContent = selectedText || 'Left aligned text';
        if (color) element.style.color = color;
        break;
      case 'center':
        element = document.createElement('div');
        element.style.textAlign = 'center';
        element.textContent = selectedText || 'Center aligned text';
        if (color) element.style.color = color;
        break;
      case 'right':
        element = document.createElement('div');
        element.style.textAlign = 'right';
        element.textContent = selectedText || 'Right aligned text';
        if (color) element.style.color = color;
        break;
      case 'ul':
        element = document.createElement('ul');
        const li1 = document.createElement('li');
        li1.textContent = selectedText || 'List item';
        if (color) li1.style.color = color;
        element.appendChild(li1);
        break;
      case 'ol':
        element = document.createElement('ol');
        const li2 = document.createElement('li');
        li2.textContent = selectedText || 'List item';
        if (color) li2.style.color = color;
        element.appendChild(li2);
        break;
      case 'a':
        element = document.createElement('a');
        element.href = '#';
        element.textContent = selectedText || 'Link text';
        if (color) element.style.color = color;
        break;
      case 'code':
        element = document.createElement('code');
        element.textContent = selectedText || 'Code snippet';
        if (color) element.style.color = color;
        break;
      case 'color':
        if (color) {
          element = document.createElement('span');
          element.style.color = color;
          element.textContent = selectedText || 'Colored text';
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    // Replace selection with new element
    range.deleteContents();
    range.insertNode(element);
    
    // Update content state and trigger onChange
    handleEditorChange();
    
    // Move caret to end of inserted element
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Focus back on the editor
    editorRef.current.focus();
  }, [showHTML, onChange, form, fieldName, handleEditorChange]);

  // Handle paste events to preserve HTML formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    
    // Get clipboard data
    const clipboardData = e.clipboardData;
    let html = clipboardData.getData('text/html');
    const text = clipboardData.getData('text/plain');
    
    // If there's HTML content, use it
    if (html) {
      // Insert the HTML into the editor
      document.execCommand('insertHTML', false, html);
    } else {
      // If it contains HTML tags, try to render them
      if (text.includes('<') && text.includes('>')) {
        if (editorRef.current) {
          const tempDiv = document.createElement('div');
          tempDiv.textContent = text; // Set as text to avoid XSS
          
          // Check if the text seems like it might be HTML
          if (/<\/?[a-z][\s\S]*>/i.test(text)) {
            try {
              // Try parsing as HTML
              tempDiv.innerHTML = text;
              document.execCommand('insertHTML', false, text);
            } catch (error) {
              // If parsing fails, just insert as plain text
              document.execCommand('insertText', false, text);
            }
          } else {
            // Just insert as plain text
            document.execCommand('insertText', false, text);
          }
        }
      } else {
        // Insert as plain text
        document.execCommand('insertText', false, text);
      }
    }
    
    // Update HTML content
    if (editorRef.current) {
      const updatedContent = editorRef.current.innerHTML;
      setHtmlContent(updatedContent);
      setEditorContent(updatedContent); // Keep preview in sync
      
      // Notify parent component
      if (onChange) {
        onChange(updatedContent);
      }
      
      // Update form value if using form integration
      if (form && fieldName) {
        form.setValue(fieldName, updatedContent);
      }
    }
  }, [onChange, form, fieldName]);

  // Copy HTML to clipboard
  const copyHtml = useCallback(() => {
    if (showHTML && htmlEditorRef.current) {
      htmlEditorRef.current.select();
      document.execCommand('copy');
      toast.success("HTML copied to clipboard");
    } else if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      navigator.clipboard.writeText(html);
      toast.success("HTML copied to clipboard");
    }
  }, [showHTML]);

  // Handle switching between HTML and Visual modes
  const toggleHtmlMode = useCallback(() => {
    // Ensure content is in sync before switching
    if (showHTML && htmlEditorRef.current) {
      // Switching from HTML to Visual
      const currentHtmlContent = htmlEditorRef.current.value;
      setHtmlContent(currentHtmlContent);
      setEditorContent(currentHtmlContent);
      
      // Update the visual editor with HTML content
      if (editorRef.current) {
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.innerHTML = currentHtmlContent;
          }
        }, 0);
      }
    } 
    else if (!showHTML && editorRef.current) {
      // Switching from Visual to HTML
      const currentVisualContent = editorRef.current.innerHTML;
      setHtmlContent(currentVisualContent);
      setEditorContent(currentVisualContent);
    }
    
    setShowHTML(!showHTML);
  }, [showHTML]);

  // New function to handle image insertion
// In RichTextEditor component, replace the handleMediaSelect function with this:

const handleMediaSelect = (media: MediaItem) => {
  setMediaDialogOpen(false);
  
  if (!media?.link) {
    toast.error("No valid image link available");
    return;
  }

  const imageUrl = media.link;
  const altText = media.altText || media.fileName || 'image';
  const imageHtml = `<img src="${imageUrl}" alt="${altText}" style="max-width: 100%; height: auto;" />`;

  // For HTML mode
  if (showHTML && htmlEditorRef.current) {
    const textarea = htmlEditorRef.current;
    const cursorPos = textarea.selectionStart;
    
    const newValue = 
      textarea.value.substring(0, cursorPos) + 
      imageHtml + 
      textarea.value.substring(cursorPos);
    
    setHtmlContent(newValue);
    textarea.value = newValue;
    textarea.focus();
    textarea.setSelectionRange(cursorPos + imageHtml.length, cursorPos + imageHtml.length);
  } 
  // For visual mode
  else if (editorRef.current) {
    // Save the current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // If no selection, append to the end
      editorRef.current.innerHTML += imageHtml;
    } else {
      const range = selection.getRangeAt(0);
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = imageHtml;
      
      // Insert the image node(s)
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      
      range.deleteContents();
      range.insertNode(fragment);
      
      // Move cursor after the inserted image
      range.setStartAfter(fragment.lastChild || fragment);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    // Force an update of the content
    handleEditorChange();
    editorRef.current.focus();
  }

  // Update the content state
  const newContent = showHTML 
    ? htmlEditorRef.current?.value || '' 
    : editorRef.current?.innerHTML || '';
  
  setEditorContent(newContent);
  setHtmlContent(newContent);
  onChange(newContent);
  
  if (form && fieldName) {
    form.setValue(fieldName, newContent);
  }
  
  toast.success("Image inserted successfully");
};


  return (
    <div className="border rounded-md">
      <div className="flex items-center justify-between border-b p-2 gap-1 bg-gray-50 flex-wrap">
        {/* Toggle between visual and HTML mode */}
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleHtmlMode}
          className="mr-2"
        >
          {showHTML ? (
            <>
              <Eye className="h-4 w-4 mr-1" />
              <span>Visual</span>
            </>
          ) : (
            <>
              <Code className="h-4 w-4 mr-1" />
              <span>HTML</span>
            </>
          )}
        </Button>
        
        <div className="flex-1 flex flex-wrap items-center gap-1">
          {/* Text formatting buttons */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('b')}
            title="Bold"
            disabled={activeTab === "preview"}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('i')}
            title="Italic"
            disabled={activeTab === "preview"}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('u')}
            title="Underline"
            disabled={activeTab === "preview"}
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          
          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                title="Text Color"
                disabled={activeTab === "preview"}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-4 gap-1">
                {colorOptions.map((color) => (
                  <Button
                    key={color.value}
                    type="button"
                    variant="outline"
                    className="h-8 w-full p-1"
                    style={{ backgroundColor: color.value === "inherit" ? "transparent" : color.value }}
                    onClick={() => insertFormatting('color', color.value)}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          
          {/* Headings */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('h1')}
            title="Heading 1"
            disabled={activeTab === "preview"}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('h2')}
            title="Heading 2"
            disabled={activeTab === "preview"}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('h3')}
            title="Heading 3"
            disabled={activeTab === "preview"}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          
          {/* Text alignment */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('left')}
            title="Align Left"
            disabled={activeTab === "preview"}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('center')}
            title="Align Center"
            disabled={activeTab === "preview"}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('right')}
            title="Align Right"
            disabled={activeTab === "preview"}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          
          {/* Lists */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('ul')}
            title="Bullet List"
            disabled={activeTab === "preview"}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('ol')}
            title="Numbered List"
            disabled={activeTab === "preview"}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-300 mx-1"></div>
          
          {/* Other elements */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => insertFormatting('a')}
            title="Insert Link"
            disabled={activeTab === "preview"}
          >
            <Link className="h-4 w-4" />
          </Button>
          
          {/* Add image button */}
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={() => setMediaDialogOpen(true)}
            title="Insert Image"
            disabled={activeTab === "preview"}
          >
            <Image className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Copy HTML button */}
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          onClick={copyHtml}
          title="Copy HTML"
          className="ml-auto"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor" className="min-h-[300px]">
          {showHTML ? (
            <textarea
              ref={htmlEditorRef}
              className="w-full h-[300px] p-4 font-mono text-sm resize-none"
              value={htmlContent}
              onChange={handleHtmlChange}
              spellCheck={false}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[300px] border-0 focus:outline-none p-4 overflow-auto"
              onInput={handleEditorChange}
              onPaste={handlePaste}
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="preview" className="min-h-[300px]">
          <div className="p-4 min-h-[300px] prose max-w-none overflow-auto">
            {editorContent ? (
              <div dangerouslySetInnerHTML={{ __html: editorContent }} />
            ) : (
              <p className="text-muted-foreground">Your content preview will appear here...</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Media Selection Dialog */}
      <MediaSelectionDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaSelect={handleMediaSelect}
      />
    </div>
  );
};

export default RichTextEditor;