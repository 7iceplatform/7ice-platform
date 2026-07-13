#!/bin/sh
set -e

KC_URL="http://keycloak:8080"
ADMIN_USER="admin"
ADMIN_PASS="admin"
REALM="7ice"
CLIENT_ID="7ice-platform"
CLIENT_SECRET="local-dev-secret-do-not-use-in-prod"
DEMO_USER="admin@7ice.local"
DEMO_PASS="admin"

echo "Waiting for Keycloak..."
until curl -sf "$KC_URL/realms/master" >/dev/null 2>&1; do
  sleep 2
done
echo "Keycloak is ready"

/opt/keycloak/bin/kcadm.sh config credentials \
  --server "$KC_URL" \
  --realm master \
  --user "$ADMIN_USER" \
  --password "$ADMIN_PASS"

echo "Creating realm $REALM..."
/opt/keycloak/bin/kcadm.sh create realms \
  -s realm="$REALM" \
  -s enabled=true \
  -s registrationAllowed=false \
  -s loginTheme=keycloak 2>/dev/null || echo "Realm $REALM already exists"

echo "Creating client $CLIENT_ID..."
/opt/keycloak/bin/kcadm.sh create clients \
  -r "$REALM" \
  -s clientId="$CLIENT_ID" \
  -s enabled=true \
  -s protocol=openid-connect \
  -s publicClient=false \
  -s secret="$CLIENT_SECRET" \
  -s "redirectUris=[\"http://localhost:3000/*\"]" \
  -s "webOrigins=[\"http://localhost:3000\"]" \
  -s directAccessGrantsEnabled=true \
  -s standardFlowEnabled=true 2>/dev/null || echo "Client $CLIENT_ID already exists"

echo "Creating user $DEMO_USER..."
/opt/keycloak/bin/kcadm.sh create users \
  -r "$REALM" \
  -s username="$DEMO_USER" \
  -s email="$DEMO_USER" \
  -s firstName="Admin" \
  -s lastName="User" \
  -s enabled=true \
  -s emailVerified=true 2>/dev/null || echo "User $DEMO_USER already exists"

echo "Setting password for $DEMO_USER..."
/opt/keycloak/bin/kcadm.sh set-password \
  -r "$REALM" \
  --username "$DEMO_USER" \
  --new-password "$DEMO_PASS" 2>/dev/null || echo "Password already set"

echo "Keycloak configured: realm=$REALM client=$CLIENT_ID user=$DEMO_USER"
