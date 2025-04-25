 Furniture Configurator
 
A web-based tool enabling users to interactively visualize and customize furniture products in 3D. Built with React and <model-viewer>, it allows real-time selection of predefined material options (colors, textures) applied directly to .glb models (customization relies on correctly named materials within the models).
Key features include:
Interactive 3D model viewing (rotate, zoom, pan).
Real-time customization preview.
Generating screenshots of the customized product.
Creating shareable configuration links (using URL query parameters).
Submitting the final configuration (options, link, screenshot) via an email form.
A minimal Node.js (Express + Nodemailer) backend solely for handling email submissions via SMTP.
(Optional) Frontend routing to load specific product models based on URL IDs.