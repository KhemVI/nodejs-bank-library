curl -X POST "http://localhost:9400/api/book" \
     -H "Content-Type: application/json" \
     -d '{
          "title":"my-title",
          "author":"my-author",
          "isbn": "X1234567890123",
          "category_id": "071d8472-e5e0-11ef-bba9-0242ac140002",
          "publish_year": 2017,
          "employee_id_created_by": "2be85a06-e5dd-11ef-bba9-0242ac140002",
          "employee_id_updated_by": "2be85a06-e5dd-11ef-bba9-0242ac140002"
         }'