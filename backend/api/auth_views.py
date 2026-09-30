from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings
import uuid


class GoogleAuthView(APIView):
    """
    Receives a Google credential (ID token) from the frontend,
    verifies it with Google's servers, and returns user info + session token.
    POST /api/v1/auth/google/
    Body: { "credential": "<google_id_token>" }
    """
    def post(self, request):
        credential = request.data.get("credential")
        if not credential:
            return Response(
                {"error": "No credential provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify the Google ID token
            google_client_id = settings.GOOGLE_CLIENT_ID
            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                google_client_id
            )

            # Extract user info from verified token
            google_user_id = id_info.get("sub")
            email          = id_info.get("email", "")
            name           = id_info.get("name", "")
            picture        = id_info.get("picture", "")
            email_verified = id_info.get("email_verified", False)

            if not email_verified:
                return Response(
                    {"error": "Google email is not verified."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get or create Django user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email.split("@")[0] + "_" + google_user_id[:6],
                    "first_name": name.split(" ")[0] if name else "",
                    "last_name": " ".join(name.split(" ")[1:]) if " " in name else "",
                }
            )

            # Return user info (in production, issue a JWT here)
            return Response({
                "success": True,
                "user": {
                    "id": user.id,
                    "email": email,
                    "name": name,
                    "picture": picture,
                    "is_new_user": created,
                },
                # Simple session token (replace with JWT in production)
                "session_token": str(uuid.uuid4()),
                "message": f"Welcome {'to VoyageAI! Your account has been created.' if created else 'back to VoyageAI!'}"
            })

        except ValueError as e:
            # Invalid token
            return Response(
                {"error": f"Invalid Google token: {str(e)}"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": f"Authentication failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
