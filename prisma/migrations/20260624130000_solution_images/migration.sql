-- Preenche a imagem de capa das soluções oficiais com os arquivos enviados
-- para public/solucoes/. Atualiza apenas quem já tem o slug correspondente;
-- não cria nem remove registros.
UPDATE "Solution" SET "image" = '/solucoes/brindes-para-rh.png' WHERE "slug" = 'brindes-para-rh';
UPDATE "Solution" SET "image" = '/solucoes/brindes-para-clientes.png' WHERE "slug" = 'brindes-para-clientes';
UPDATE "Solution" SET "image" = '/solucoes/eventos-corporativos.png' WHERE "slug" = 'eventos-corporativos';
UPDATE "Solution" SET "image" = '/solucoes/kits-corporativos.png' WHERE "slug" = 'kits-corporativos';
UPDATE "Solution" SET "image" = '/solucoes/sustentaveis.png' WHERE "slug" = 'sustentaveis';
UPDATE "Solution" SET "image" = '/solucoes/premium.png' WHERE "slug" = 'premium';
