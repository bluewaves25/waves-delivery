# What I need from you to deploy on Render from here

Yes — I can drive the deploy if you send these (paste in chat; revoke/rotate after):

## Required

1. **Render API Key**  
   Render Dashboard → Account Settings → API Keys → Create  
   https://dashboard.render.com/u/settings#api-keys

2. **GitHub repo for this project** (private is fine)  
   Either:
   - Create an empty GitHub repo and send: repo URL + a **GitHub Personal Access Token** with `repo` scope  
     https://github.com/settings/tokens  
   - Or connect GitHub in Render yourself, push the code, and only send the Render API key + the GitHub repo URL

## Optional but helpful

3. Preferred service names (defaults already in `render.yaml`: `dpdms-api`, `dpdms-web`)  
4. Custom domain (skip for now)

## I will then

- Init/push git to your GitHub repo  
- Create Blueprint services via Render API / dashboard instructions  
- Set `API_BASE_URL` on the web service  
- Trigger deploy + seed Ghana data  

## Do NOT send

- Your Render account password  
- Payment card details
