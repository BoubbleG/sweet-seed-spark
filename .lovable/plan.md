## Diagnóstico
Testei (HEAD) as 41 URLs únicas do Unsplash aplicadas no Skina do Lanche. **8 retornam 404** (foto removida do Unsplash), afetando 13 produtos:

| URL quebrada | Produtos afetados |
|---|---|
| `photo-1610614091929-cb5cb3d72e98` | Combo 10 |
| `photo-1626078299034-94a83e0d77a9` | Combo 7 |
| `photo-1605478371310-0d6f63dee6db` | Pizza Chocolate |
| `photo-1542587222-f9172e0bb1e7` | Pizza Paulista |
| `photo-1548365328-9f547fb09530` | Pizza Presunto |
| `photo-1622597467836-f3e6707e1191` | Suco Acerola 500ml + Jarra Acerola + Suco Maracujá 500ml + Jarra Maracujá |
| `photo-1571805341302-f857805690e0` | Suco Cupuaçu 500ml + Jarra Cupuaçu |
| `photo-1546872931-886122ee79b0` | Suco Goiaba 500ml + Jarra Goiaba |

## Correção
Update SQL em `products` substituindo as 8 URLs por fotos válidas do Unsplash, validadas previamente com HEAD 200:

- Combo 10 / Combo 7 → outras fotos de combo lanche (hambúrguer + acompanhamento)
- Pizza Chocolate → foto de pizza doce
- Pizza Paulista / Pizza Presunto → fotos de pizza tradicional
- Sucos cítricos (acerola, maracujá) → foto genérica de suco amarelo/cítrico
- Sucos polpa (cupuaçu, goiaba) → fotos genéricas de suco rosado/cremoso

Após o update, rodo HEAD em cada URL nova para confirmar 200.
