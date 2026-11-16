# Lector — como trabalhar neste repositório

O dono programa pelo celular e **não quer fazer nada manual** (nem editar no GitHub, nem subir arquivos).
Quando ele pedir uma mudança, faça tudo sozinho, de ponta a ponta:

1. Edite `index.html` (e outros arquivos, se preciso). Confira a sintaxe dos `<script>` antes de commitar.
2. **Sempre aumente `VERSAO` em `sw.js`** (ex.: `lector-v54` → `lector-v55`) quando mudar arquivos do app, para os celulares pegarem a atualização.
3. Faça commit e push na branch da sessão.
4. Abra o Pull Request para `main` e faça o merge (squash) em seguida. O site é publicado a partir da `main`.
5. Só peça ajuda ao dono se não houver outro jeito. Responda curto e simples, em português.

Observações:
- O app inteiro roda dentro de uma função em `index.html`; para testar um trecho, copie-o para uma página mínima.
- Se a branch da sessão ficar divergente da `main` depois de um squash, reaproveite-a a partir de `origin/main` e junte o histórico antigo com `git merge -s ours`, sem force push.
